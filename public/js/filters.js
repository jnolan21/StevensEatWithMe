document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.addEventListener('click', function (e) {
      e.stopPropagation(); // prevents dropdown from closing on click
    });
  });


let dietaryFilter = document.getElementById('dietaryFilter');