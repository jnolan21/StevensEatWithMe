document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.addEventListener('click', function (e) {
      e.stopPropagation(); // prevents dropdown from closing on click
    });
  });




let requestConfig = {
    method: 'GET',
    url: '/api/diningList'
  };


const validateMenuItems = (arr) => {

  if (!Array.isArray(arr)) throw "Must be a valid array";
  if (arr.length === 0) throw "Empty Array"

}


$.ajax(requestConfig).then(function (responseMessage) {
    
    let restaurantList = document.getElementById("restaurant");

    responseMessage.forEach((restaurant) => {
        let element = $(`<li><label for = "${restaurant._id}"><input type="radio" name = "restaurantId" id = "${restaurant._id}"value="${restaurant._id}">${restaurant.name}</label></li>`);
        $(restaurantList).append(element);
    });

    $('#restaurant input').change(function() {
        $('#menuItems').empty();

        let menuItems;
        let menuList;
        let boof;

        try {

        boof = responseMessage.find((rest) => validateId(rest._id) === this.value);
        if (boof === undefined) throw "Cannot find restaurant";
        menuItems = boof.menuItems;
        validateMenuItems(menuItems);
        menuList = document.getElementById("menuItems");
        } catch(e) {
          return;
        }

        menuItems.forEach((item) => {
            let element = $(`<li><label for = "${item._id}"><input type="radio" name = "menuId" id = "${item._id}" value="${item._id}">${item.name}</label></li>`);
            $(menuList).append(element);
        });
        
    })
  });




