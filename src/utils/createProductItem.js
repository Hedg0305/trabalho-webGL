export function createProductItem(name, price, id) {
  const template = fetch("../components/product-item.html")
    .then((response) => response.text())
    .then((data) => {
      data = data.replace("{{NAME}}", name);
      data = data.replace("{{PRICE}}", price);
      data = data.replace(/{{ID}}/g, id);
      return data;
    });
  return template;
}
