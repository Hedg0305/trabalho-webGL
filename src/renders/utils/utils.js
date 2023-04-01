const degToRad = (d) => (d * Math.PI) / 180;

const radToDeg = (r) => (r * 180) / Math.PI;

const addToCart = (itemName, objHref, price) => {
  //get the cart from local storage, if dont exist create it
  var cart = JSON.parse(localStorage.getItem("cart"));
  if (cart == null) {
    cart = [];
  }
  //add the item to the cart
  obj = {
    name: itemName,
    href: objHref,
    price: price,
  };

  cart.push(obj);
  document.getElementById("total").innerHTML = `${cart.length}`;
  //save the cart to local storage
  localStorage.setItem("cart", JSON.stringify(cart));
};

const totalPrice = () => {
  var cart = JSON.parse(localStorage.getItem("cart"));
  var totalPrice = 0.0;
  if (cart == null) {
    cart = [];
  } else {
    cart.forEach((item) => {
      totalPrice += Number(item.price);
    });
  }
  document.getElementById("totalPrice").innerHTML = `${totalPrice}`;
};

const setRectangle = (gl, x, y, width, height) => {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  );
};
