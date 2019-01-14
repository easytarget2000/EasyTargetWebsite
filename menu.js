function ShowMenu(menuId){
    var menuId = document.getElementById(menuId);

    if (menuId.style.display == 'block') {
        menuId.style.display = 'none';
    } else {
        menuId.style.display = 'block';                    
    }
}

function HideMenu(){
    var menuId = document.getElementByClass("hidden_menu");

    if (menuId.style.display == 'block') {
        menuId.style.display = 'none';
    } else {
        menuId.style.display = 'block';                    
    }
}