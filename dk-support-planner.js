(function(){
var x=document.createElement('div');
x.style.cssText='position:fixed;top:5px;left:5px;right:5px;bottom:5px;z-index:999999;background:white;color:black;border:3px solid black;padding:10px;font-size:13px;overflow:auto;';
x.textContent=document.body.innerText.slice(0,10000);
document.body.appendChild(x);
})();
