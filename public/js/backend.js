
  document.addEventListener("DOMContentLoaded", function(event) {
    function picknumber(num) {
    var pin_code = document.getElementById("pin_code");
    var pinc = document.getElementById("pinc");
    pin_code.value = pin_code.value + num;
    pinc.value = pinc.value + "*";
}
 function resetpicker() {
    var pin_code = document.getElementById("pin_code");
    var pinc = document.getElementById("pinc");
    pin_code.value = '';
    pinc.value = '';
}
  })