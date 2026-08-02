import json, re, subprocess
from pathlib import Path
root=Path.cwd()
def from_head(path):
    return json.loads(subprocess.check_output(['git','show',f'HEAD:{path}'],cwd=root,text=True,encoding='utf-8'))
meta_path=root/'packages/catalog/data/catalog-reading-meta.json'
manifest_path=root/'packages/catalog/data/manifest.json'
meta=json.loads(meta_path.read_text(encoding='utf-8'))
manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
head_meta=from_head('packages/catalog/data/catalog-reading-meta.json')
head_manifest=from_head('packages/catalog/data/manifest.json')
pet=lambda item: item.get('id','').startswith('catalog-reading-pet-b1-test')
for item in filter(pet,head_meta):
    if not any(current.get('id')==item['id'] for current in meta): meta.append(item)
for item in filter(pet,head_manifest.get('reading',[])):
    if not any(current.get('id')==item['id'] for current in manifest['reading']): manifest['reading'].append(item)
natural=lambda item:[int(part) if part.isdigit() else part for part in re.split(r'(\d+)',item.get('id',''))]
meta.sort(key=natural)
manifest['reading'].sort(key=natural)
meta_path.write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('restored PET index entries from HEAD')
