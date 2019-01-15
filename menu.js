function toggleMenu(menuId){
    let allMenus = document.getElementsByClassName("hidden_menu");

    [].forEach.call(
        allMenus,
        function(menu) {
            if (menuId === menu.id) {
                ShowElement(menu);
            } else {
                hideElement(menu);
            }
        }
    );
}

function showElement(element){
    element.style.display = "block";
}

function hideElement(element){
    element.style.display = "none";
}