document.addEventListener("DOMContentLoaded", ()=>{
  const form = document.getElementById("contact-form");
  if(!form) return;
  form.addEventListener("submit", async e=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    // enviar al backend placeholder
    try{
      await fetch("/api/contact", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
      Swal.fire('Enviado','Tu mensaje se envió. Recibirás respuesta por correo (simulado).','success');
      form.reset();
    }catch(err){
      Swal.fire('Simulado','Mensaje guardado local (demo).','info');
      form.reset();
    }
  });
});