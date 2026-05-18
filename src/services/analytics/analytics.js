import {
  mainSanWaterRoute,
  SANWATERGROUPROUTES,
} from "@/configs/routes/routesConfig";

import { analyticsAPI } from "../baseAPIs";

const API_URL = `${
  import.meta.env.VITE_BACK_END_BASE_URL
}/analytics/track`;

const FETCH_API_URL = `/summary`;

const SESSION_KEY = "session_id";
const VISITOR_KEY = "visitor_id";
const SOURCE_KEY = "source";
const CAMPAIGN_KEY = "campaign";
const MEDIUM_KEY = "medium";

const BOT_REGEX =
  /bot|crawler|spider|crawling|facebookexternalhit|Slackbot|WhatsApp/i;


function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    return null;
  }
}

function generateId() {
  return crypto.randomUUID();
}

function getSessionId() {
  let session = safeStorageGet(SESSION_KEY);

  if (!session) {
    session = generateId();
    safeStorageSet(SESSION_KEY, session);
  }

  return session;
}

function getVisitorId() {
  let visitor = safeStorageGet(VISITOR_KEY);

  if (!visitor) {
    visitor = generateId();
    safeStorageSet(VISITOR_KEY, visitor);
  }

  return visitor;
}

function parseUTMParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
  };
}

function detectSource() {
  const cached = safeStorageGet(SOURCE_KEY);

  if (cached) return cached;

  const utm = parseUTMParams();

  if (utm.source) {
    safeStorageSet(SOURCE_KEY, utm.source);
    return utm.source;
  }

  const ref = document.referrer;

  let source = "direct";

  if (!ref) {
    source = "direct";
  } else if (
    ref.includes("google") ||
    ref.includes("bing") ||
    ref.includes("yahoo")
  ) {
    source = "search";
  } else if (
    ref.includes("facebook") ||
    ref.includes("instagram") ||
    ref.includes("tiktok") ||
    ref.includes("linkedin") ||
    ref.includes("twitter")
  ) {
    source = "social";
  } else {
    source = "referral";
  }

  safeStorageSet(SOURCE_KEY, source);

  return source;
}

function getMedium() {
  const cached = safeStorageGet(MEDIUM_KEY);

  if (cached) return cached;

  const utm = parseUTMParams();

  if (utm.medium) {
    safeStorageSet(MEDIUM_KEY, utm.medium);
    return utm.medium;
  }

  return null;
}

function getCampaign() {
  const cached = safeStorageGet(CAMPAIGN_KEY);

  if (cached) return cached;

  const utm = parseUTMParams();

  if (utm.campaign) {
    safeStorageSet(CAMPAIGN_KEY, utm.campaign);
    return utm.campaign;
  }

  return null;
}

function getDevice() {
  const ua = navigator.userAgent.toLowerCase();

  if (BOT_REGEX.test(ua)) return "bot";

  if (/tablet|ipad/i.test(ua)) return "tablet";

  if (/mobile|android|iphone/i.test(ua)) return "mobile";

  return "desktop";
}

function getBrowser() {
  const ua = navigator.userAgent;

  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";

  return "Unknown";
}

function getOS() {
  const ua = navigator.userAgent;

  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac")) return "MacOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";

  return "Unknown";
}

function shouldIgnorePath(path) {
  if (!path) return true;

  if (path.includes(mainSanWaterRoute)) return true;

  const ignoredRoutes = [
    mainSanWaterRoute,
    "/admin",
    "/dashboard",
  ];

  return ignoredRoutes.some((route) => path.startsWith(route));
}

function buildBaseEvent() {
  return {
    session_id: getSessionId(),
    visitor_id: getVisitorId(),

    source: detectSource(),
    medium: getMedium(),
    campaign: getCampaign(),

    referrer: document.referrer || null,
    user_agent: navigator.userAgent,

    device: getDevice(),
    browser: getBrowser(),
    os: getOS(),

    screen: {
      width: window.screen.width,
      height: window.screen.height,
    },

    language: navigator.language,
    timezone:
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",

    ts: new Date().toISOString(),
  };
}


function sendEvent(event) {
  try {
    const payload = JSON.stringify(event);

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], {
        type: "application/json",
      });

      navigator.sendBeacon(API_URL, blob);
      return;
    }

    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch (error) {
    console.error("Analytics transport error:", error);
  }
}

export function trackPageView(path) {
  if (shouldIgnorePath(path)) return;

  sendEvent({
    ...buildBaseEvent(),

    type: "page_view",

    path,
  });
}

export function trackConversion(
  name = "default",
  options = {}
) {
  sendEvent({
    ...buildBaseEvent(),

    type: "conversion",

    conversion_name: name,

    value:
      typeof options.value === "number"
        ? options.value
        : 0,

    meta: options.meta || {},
  });
}

export function trackCTA(
  name = "cta_click",
  meta = {}
) {
  sendEvent({
    ...buildBaseEvent(),

    type: "cta_click",

    conversion_name: name,

    meta,
  });
}

export function trackCustomEvent(
  type,
  meta = {}
) {
  sendEvent({
    ...buildBaseEvent(),

    type,

    meta,
  });
}


export async function fetchAnalytics({
  from,
  to,
}) {
  try {
    const params = new URLSearchParams();

    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const query = params.toString();

    const endpoint = query
      ? `${FETCH_API_URL}?${query}`
      : FETCH_API_URL;

    const res = await analyticsAPI.get(endpoint);

    if (res.status !== 200) {
      throw new Error("Failed to fetch analytics");
    }

    return res.data?.data || null;
  } catch (error) {
    console.error("fetchAnalytics error:", error);
    throw error;
  }
}