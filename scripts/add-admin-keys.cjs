const fs = require('node:fs');
const file = 'scripts/admin-jsx-catalog.json';
const catalog = JSON.parse(fs.readFileSync(file, 'utf8'));
const additions = {
  common: { all: 'All', permission_denied: 'You do not have permission.' },
  analytics: {},
  auth: {},
  sales: {},
  hiring: {
    required_job_fields: 'Enter a title, location, type, and description.',
    failed_to_save_job_post: 'Could not save the job post.',
    editor_description: 'Keep the position clear, structured, and easy to scan.',
  },
  leads: {
    total_leads: 'Total leads', pipeline_value: 'Pipeline value',
    lead_count: '{{count}} leads', quantity_source: 'Quantity {{quantity}} · {{source}}',
    lead_created: 'Lead created', unknown_source: 'Unknown source', system: 'System',
    assignment_changed: 'Assignment changed', unassigned: 'Unassigned',
    internal_note: 'Internal note', note_by_author: '{{author}}: {{content}}',
  },
  news: {
    defaults_to_article_title: 'Defaults to the article title',
    defaults_to_excerpt: 'Defaults to the excerpt',
    seo_title_length: 'SEO title · {{count}} / ~60',
    meta_description_length: 'Meta description · {{count}} / ~160',
  },
  products: {
    empty_inventory: 'Your inventory is empty. Add your first product to get started.',
    product_updated: 'Product “{{name}}” was updated.',
    product_created: 'Product “{{name}}” was created.',
    serial_number_immutable: 'The serial number cannot be changed after creation.',
    serial_number_description: 'Unique identifier for this product.',
    slug_change_warning: 'Changing the slug may break the existing public URL.',
    slug_auto_generation: 'Leave this blank to generate it automatically.',
  },
  families: {
    one_product_assigned: '{{count}} product assigned to {{family}}.',
    products_assigned: '{{count}} products assigned to {{family}}.',
    one_product_unassigned: '{{count}} product unassigned.',
    products_unassigned: '{{count}} products unassigned.',
    family_updated: 'Family updated.', family_created: 'Family created.',
    sub_family_updated: 'Subfamily updated.', sub_family_created: 'Subfamily created.',
    family_save_failed: 'Could not save the family.',
    sub_family_save_failed: 'Could not save the subfamily.',
    family_deleted: 'Family deleted.', sub_family_deleted: 'Subfamily deleted.',
  },
  users: {
    super_admin_permissions_immutable: 'Super admin permissions cannot be changed.',
    edit_permissions: 'Edit permissions',
    super_admin_cannot_be_deleted: 'The super admin account cannot be deleted.',
    delete_user: 'Delete user',
  },
  profile: {
    full_name_required: 'Full name is required.',
    invalid_phone_number: 'Enter a valid phone number.',
    invalid_image_url: 'Enter a valid image URL.',
    current_password_required: 'Current password is required.',
    password_too_short: 'The password must contain at least 8 characters.',
    passwords_do_not_match: 'Passwords do not match.',
  },
};
for (const [namespace, keys] of Object.entries(additions)) {
  catalog[namespace] = { ...(catalog[namespace] || {}), ...keys };
}
fs.writeFileSync(file, JSON.stringify(catalog, null, 2) + '\n');
