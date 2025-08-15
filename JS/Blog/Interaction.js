//閲讀更多
function readmorebtn(){
	let button = document.querySelectorAll('.readmore');
	if (button.length > 0){
	  	button.forEach(btn => {
	  		btn.addEventListener('click', function() {
	  			let btn1 = btn.parentElement;
	  			btn1 = btn1.children[0];
	  			if(btn1.style.maxHeight == "none"){
	  				btn1.style.maxHeight = "317px";
	  				btn1.scrollIntoView();
	  				window.scrollTo(0, window.scrollY - 25);
	  				btn.innerText = "展開更多";
	  			}
	  			else{
	  				btn1.style.maxHeight = "none";
	  				btn.innerText = "收回";
	  			}
				//console.log(btn1.style.maxHeight);
	  		});
			//滑鼠移入 & 移出
			/*btn.addEventListener('mouseover', function() {
				btn.style.color = "#47285e";
			});
			btn.addEventListener('mouseout', function() {
				btn.style.color = "#8757ad";
			});*/
	  	});
	}
}