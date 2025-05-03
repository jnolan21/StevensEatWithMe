document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.addEventListener('click', function (e) {
      e.stopPropagation(); // prevents dropdown from closing on click
    });
  });


let requestConfig = {
    method: 'GET',
    url: '/api/diningList'
  };



$.ajax(requestConfig).then(function (responseMessage) {
    
    let restaurantList = document.getElementById("restaurant");

    responseMessage.forEach((restaurant) => {
        let element = $(`<li><label><input type="radio" name = "restaurantId" value="${restaurant._id}">${restaurant.name}</label></li>`);
        $(restaurantList).append(element);
    });

    $('#restaurant input').change(function() {
        $('#menuItems').empty();

        let boof = responseMessage.find((rest) => rest._id === this.value);
        let menuItems = boof.menuItems;
        let menuList = document.getElementById("menuItems");

        menuItems.forEach((item) => {
            let element = $(`<li><label><input type="radio" name = "menuId" value="${item._id}">${item.name}</label></li>`);
            $(menuList).append(element);
        });
        
    })
  });




