// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }
        // Mostrar el mensaje pop-up
        const overlay = document.getElementById('overlay');
        overlay.classList.remove('d-none');

        const popupMessage = document.getElementById('popupMessage');
        popupMessage.classList.remove('d-none');
        popupMessage.classList.add('d-block');

        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
          popupMessage.classList.remove('d-block');
          popupMessage.classList.add('d-none');
          overlay.classList.add('d-none');
        }, 3000);

      form.classList.add('was-validated')
    }, false)
  })
})()

