function ToggleMenu(menuId){
    var allMenus = document.getElementsByClassName("hidden_menu");

    [].forEach.call(
        allMenus,
        function(menu) {
            if (menuId === menu.id) {
                ShowElement(menu);
            } else {
                HideElement(menu);
            }
        }
    );
}

function ShowElement(element){
    element.style.display = "block";
}

function HideElement(element){
    element.style.display = "none";
}