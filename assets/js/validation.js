// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  const overlay = document.getElementById('overlay');
  const popupMessage = document.getElementById('popupMessage');

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      } else {

        //PREVENIR EL ENVIO DEL FORM MIENTRAS MOSTRAMOS UN MENSAJE
        //ESTO NO ES RECOMENDADO PERO YA QUE NO CONTAMOS CON SERVER ES UNA FORMA DE MOSTRAR MENSAJES
        event.preventDefault()
        popupMessage.classList.remove('d-none');
        setTimeout(() => {
          popupMessage.classList.add('d-none');
          form.submit();
        }, 3000);
      }
      form.classList.add('was-validated')
    }, false)
  })
})()

