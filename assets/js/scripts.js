// Código JavaScript aquí 
/*
document.addEventListener("DOMContentLoaded", function() {

    //CONTENIDO MODULAR

    // Selecciona el elemento donde se cargará el footer
    const footerContainer = document.getElementById("footer");

    // Utiliza fetch para obtener el contenido del footer desde footer.html
    fetch("assets/modulos/footer.html")
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error("No se pudo cargar el footer.");
            }
        })
        .then(data => {
            footerContainer.innerHTML = data;
        })
        .catch(error => {
            console.error("Error al cargar el footer:", error);
        });
});
*/