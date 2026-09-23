"""Draft locale copy for review; preserves keys and resumes from a cache."""
import json
import html
import time
import urllib.parse
import urllib.request
from pathlib import Path

base = Path(__file__).parent
catalog = json.loads((base / 'admin-jsx-catalog.json').read_text(encoding='utf-8'))
existing = json.loads((base / 'admin-existing.json').read_text(encoding='utf-8'))
cache_file = base / 'admin-translation-cache.json'
cache = json.loads(cache_file.read_text(encoding='utf-8')) if cache_file.exists() else {'fr': {}, 'ar': {}}

all_values = list(dict.fromkeys(value for ns in catalog.values() for value in ns.values()))
existing_by_value = {lang: {} for lang in ('fr', 'ar')}
for lang in ('fr', 'ar'):
    for ns, rows in existing['en'].items():
        for key, value in rows.items():
            if isinstance(value, str) and isinstance(existing[lang].get(ns, {}).get(key), str):
                existing_by_value[lang][value] = existing[lang][ns][key]

def translate_batch(batch, lang):
    joiner = '\n\n@@@\n\n'
    q = joiner.join(batch)
    if True:
        url = 'https://translate.googleapis.com/translate_a/single?' + urllib.parse.urlencode({'client': 'gtx', 'sl': 'en', 'tl': lang, 'dt': 't', 'q': q})
        with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=30) as response:
            payload = json.load(response)
        translated_text = ''.join(part[0] for part in payload[0])
    else:
        url = 'https://api.mymemory.translated.net/get?' + urllib.parse.urlencode({'q': q, 'langpair': f'en|{lang}'})
        with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=30) as response:
            payload = json.load(response)
        if payload.get('responseStatus') != 200:
            raise RuntimeError(f"translation service returned {payload.get('responseStatus')}: {payload.get('responseDetails')}")
        translated_text = payload['responseData']['translatedText']
    results = html.unescape(translated_text).split('@@@')
    if len(results) != len(batch):
        raise RuntimeError(f'expected {len(batch)} entries; got {len(results)}')
    return [item.strip() for item in results]

for lang in ('fr', 'ar'):
    todo = [v for v in all_values if v not in cache[lang]]
    print(lang, len(todo), 'to translate', flush=True)
    while todo:
        batch = []
        size = 0
        while todo and size + len(todo[0].encode('utf-8')) < 380 and len(batch) < 7:
            value = todo.pop(0)
            if value in existing_by_value[lang]:
                cache[lang][value] = existing_by_value[lang][value]
                continue
            batch.append(value)
            size += len(value.encode('utf-8')) + 7
        if not batch:
            continue
        for attempt in range(4):
            try:
                translated = translate_batch(batch, lang)
                break
            except Exception as exc:
                if attempt == 3:
                    print('STOP', lang, batch, exc, flush=True)
                    cache_file.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding='utf-8')
                    raise
                time.sleep(2 ** attempt)
        for original, result in zip(batch, translated):
            cache[lang][original] = result
        cache_file.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding='utf-8')
        print(lang, len(cache[lang]), '/', len(all_values), flush=True)
        time.sleep(0.25)
