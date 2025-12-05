document.addEventListener("DOMContentLoaded", ()=>{
  const form = document.getElementById("contact-form");
  if(!form) return;
  form.addEventListener("submit", async e=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    try{
      const resp = await fetch(`${API_URL}/api/contacto`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(data)
      });

      const cuerpo = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        const msg = cuerpo.message || cuerpo.error || 'No se pudo enviar tu mensaje';
        await Swal.fire('Error', msg, 'error');
        return;
      }

      await Swal.fire('Enviado','Tu mensaje se envió. Te enviaremos una respuesta por correo.','success');
      form.reset();
    }catch(err){
      console.error('Error al enviar contacto:', err);
      await Swal.fire('Error','No se pudo conectar con el servidor para enviar tu mensaje.','error');
    }
  });
});
