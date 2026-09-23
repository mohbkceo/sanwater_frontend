from pathlib import Path

roots = [Path('src/routes/sanwatergroup'), Path('src/components/dashboard')]
files = [p for root in roots for p in root.rglob('*.jsx')]
files += [Path('src/components/products/ProductForm.jsx'), Path('src/components/products/ProductCard.jsx'), Path('src/layouts/DashboardLayout.jsx')]
pairs = [
    ('text-left', 'text-start'), ('text-right', 'text-end'),
    ('ml-', 'ms-'), ('mr-', 'me-'), ('pl-', 'ps-'), ('pr-', 'pe-'),
    ('border-l-', 'border-s-'), ('border-r-', 'border-e-'),
    ('left-', 'start-'), ('right-', 'end-'),
]
count = 0
for file in files:
    original = file.read_text(encoding='utf-8')
    updated = original
    for before, after in pairs:
        updated = updated.replace(before, after)
    if updated != original:
        file.write_text(updated, encoding='utf-8')
        count += 1
print(f'Updated {count} files')
