const form = document.querySelector('#ficha');
const { assinatura, pseudonimo, imagem, arquivo } = form.elements;
const status = document.querySelector('#status');

function synchronizeFields() {
  const usesPseudonym = assinatura.value === 'pseudonimo';
  document.querySelector('#campo-pseudonimo').hidden = !usesPseudonym;
  pseudonimo.disabled = !usesPseudonym;
  pseudonimo.required = usesPseudonym;

  const usesImage = ['foto', 'ilustracao'].includes(imagem.value);
  document.querySelector('#campo-arquivo').hidden = !usesImage;
  arquivo.disabled = !usesImage;
  arquivo.required = usesImage;
  if (!usesImage) arquivo.value = '';
}

function validateFile() {
  const file = arquivo.files[0];
  const types = ['image/jpeg', 'image/png', 'image/webp'];
  const invalid = file && (!types.includes(file.type) || file.size > 10 * 1024 * 1024);
  arquivo.setCustomValidity(invalid ? 'Selecione um JPG, PNG ou WebP de até 10 MB.' : '');
}

assinatura.addEventListener('change', synchronizeFields);
imagem.addEventListener('change', synchronizeFields);
arquivo.addEventListener('change', validateFile);
synchronizeFields();

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  validateFile();
  if (!form.reportValidity()) return;
  const button = form.querySelector('button');
  button.disabled = true;
  status.textContent = '';
  try {
    const data = new FormData(form);
    const fields = ['nome', 'titulo', 'assinatura', 'pseudonimo', 'imagem', 'circulacao'];
    const labels = ['Nome completo', 'Título da crônica', 'Assinatura', 'Pseudônimo', 'Imagem', 'Circulação autorizada'];
    const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
    const details = fields.map((field, index) => {
      const control = form.elements[field];
      const value = control.selectedOptions ? control.selectedOptions[0].textContent : data.get(field);
      return value ? '<dt><strong>' + labels[index] + '</strong></dt><dd>' + escape(value) + '</dd>' : '';
    }).join('');
    const file = data.get('arquivo');
    let attachment = '';
    if (file?.size) {
      const url = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      attachment = '<h2>Imagem anexada</h2><p>' + escape(file.name) + '</p><img style="max-width:100%;height:auto" alt="Imagem enviada com a ficha" src="' + url + '">';
    }
    const saved = '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Ficha de publicação</title><body style="max-width:740px;padding:24px;margin:auto;font:18px/1.5 system-ui"><h1>Ficha de publicação</h1><p>Chão de Palavra · OPLA com os PECs</p><dl>' + details + '</dl>' + attachment + '</body></html>';
    const url = URL.createObjectURL(new Blob([saved], { type: 'text/html;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ficha-chao-de-palavra.html';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    status.textContent = 'Ficha preparada. Confira o arquivo nos downloads e entregue-o à equipe do estágio.';
  } catch {
    status.textContent = 'Não foi possível preparar a ficha. Tente novamente.';
  } finally {
    button.disabled = false;
  }
});
