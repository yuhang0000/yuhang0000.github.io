var bloglist; //列表
var bloglisturl = './Blog.txt'; //主列表地址
var blogliststep = 10; //每頁讀取個數

//頁碼導航條
var pageitemnum; //縂頁數
var pagebar_disable = false;
let pagebar = document.querySelector('.pagebar');
let pagebar_label = pagebar.querySelector('.pagelabel');
let pagebar_top = pagebar.querySelector('.pagetop');
let pagebar_bottom = pagebar.querySelector('.pagebottom');
let pagebar_nums = pagebar.querySelectorAll('.pagenum'); 

//報錯: 訊息, 請求連接, 頁面標題, url 請求鍵, url 請求值, 是否輸出資訊
function oops(msg, url = null, title = null, key = null, value = null, output = false){
	if(key != null){
		let url = new URL(window.location.href);
		url.searchParams.set(key, value);
		history.pushState(null,title,url);
	}
	let blog_body = document.querySelector('.blog_body');
	let link = ''
	if(url != null){
		link = '<div style="padding-top: 8px;">請求連接: <a class="link" href="' + url + '" target="_blank">' + url + '</a></div>';
	}
	let html = '<div class="blog_item" style="display: inline-block; padding: 8px; white-space: pre-wrap;">' + msg + link + '</div>';
	if(output == false){
		blog_body.innerHTML = html;
	}
	else{
		return html;
	}
}

//讀取部落格條目
async function readblog(page = 1){
	//移除舊的部落格
	pagebar.classList.add('disable');
	window.scrollTo(0,0);
	let blog_body = document.querySelector('.blog_body');
	for(let num of blog_body.querySelectorAll('.blog_item')){ 
		if(num != null){
			num.remove();
		}
	}
	
	//假如沒有任何部落格
	if(pageitemnum == 0 || pageitemnum == null){
		oops('這裏好像什麽都木有.',null,null,'page', 1);
		pagebar.classList.remove('disable');
		return;
	}
	
	//假如頁碼超出範圍
	if(page == null || page < 1){
		page = 1;
		let url = new URL(window.location.href);
		url.searchParams.set('page', 1);
		history.pushState(null,null,url);
		//return;
	}
	else if(page > pageitemnum){
		page = pageitemnum;
		let url = new URL(window.location.href);
		url.searchParams.set('page', pageitemnum);
		history.pushState(null,null,url);
	}
	
	//更新頁碼
	let num2 = page - 2;
	if(num2 < 1){
		num2 = 1;
	}
	else if(num2 > pageitemnum - 4){
		num2 = pageitemnum - 4;
	}
	for(let num of pagebar_nums){
		if(num2 == page){
			num.classList.add('checked');
		}
		else{
			num.classList.remove('checked');
		}
		//debugger;
		if(num2 < 1 || num2 > pageitemnum){
			num.classList.add('hidden');
		}
		else{
			num.classList.remove('hidden');
		}
		num.innerText = num2;
		num2++;
	}
	pagebar_label.innerText = 'Page ' + page + ' of ' + pageitemnum;
	
	//分別加載部落格
	for(let num = (page - 1) * blogliststep ; num < page * blogliststep; num++){
		if(num >= bloglist.length){ //超出列表索引範圍
			break;
		}
		let url = bloglist[num];
		if(url == '' || url == null || url == './'){
			continue;
		}
		await fetch(url.trim(), {cache: 'no-cache'})
			.then(response => {
				if(response.ok == true){
					return response.text();
				}
				else{
					return null;
				}
			})
			.then(data => {
				if(data != null){
				  if(url.trim().indexOf('.md') != -1){
				    blog_body.innerHTML = blog_body.innerHTML + '<div class="blog_item" href="' + url.trim() + '">' + md.read(data) + '</div>'; //MarkDown
				  }
				  else{
				    blog_body.innerHTML = blog_body.innerHTML + '<div class="blog_item" href="' + url.trim() + '">' + data + '</div>'; //HTML
					}
				}
				else{
					blog_body.innerHTML = blog_body.innerHTML + '<div class="blog_item" style="padding: 8px;">' + '載入失敗哩...' + '</div>';
				}
			})
			.catch(error => {
				//debugger;
				blog_body.innerHTML = blog_body.innerHTML + oops('oops! \n  ' + error, url.trim(),null,'page', 1,true);
				//pagebar.classList.add('disable');
			});
	}
	
	//展開按鈕
	readmorebtn();

	pagebar.classList.remove('disable');
}

//讀取部落格列表
async function readbloglist(){
	pagebar.classList.add('disable');
	//测试 MarkDown
	let url = new URL(window.location.href);
	if(url.searchParams.get('test') != null){
	  bloglist = ['/Test/Test.md'];
	  pageitemnum = 1;
	  pagebar.classList.remove('disable');
	  readblog(1);
	  return;
	}
	try{
		await fetch(bloglisturl, {cache: 'no-cache'})
			.then(response => {
				if(response.ok == true){
					return response.text();
				}
				else{
					oops('oops! \n  (' + response.status + ') ' + response.statusText, response.url,null,'page', 1);
					return null;
				}
			})
			.then(data => {
				//console.log(data);

				if(data == null){ //獲取失敗了
					pagebar.classList.remove('disable');
					return false;
				}
				
				//篩選列表
				bloglist = new Array();
				for(let list of data.split('\n')){
					if(list == null || list == '' || list == './'){
						continue;
					}
					bloglist.push(list.trim());
				}
				
				//console.log(bloglist);
				//console.log( bloglist.length / blogliststep );
				//pageitemnum = parseInt(bloglist.length / blogliststep) + 1;
				
				//計算分頁數量
				pageitemnum = bloglist.length / blogliststep; 
				if(String(pageitemnum).indexOf('.') != -1){
					if(pageitemnum != 0){
						pageitemnum = parseInt(pageitemnum) + 1;
					}
				}
				//console.log(pageitemnum);
				
				//獲取當前頁碼
				let url = new URL(window.location.href);
				readblog( url.searchParams.get('page') );
			})
			.catch(error => {
				oops('oops! \n  ' + error, bloglisturl,null,'page', 1);
				pagebar.classList.remove('disable');
				//console.log('oops! \n' + error);
			});
	}
	catch (ex){
		oops('oops! \n  ' + ex, bloglisturl,null,'page', 1);
		pagebar.setAttribute('disable', 'false');
		//console.log('oops! \n' + ex);
	}
}

//主程式
async function main(){
	await readbloglist();
	let url = new URL(window.location.href);
	pagebar_top.addEventListener('click', () => { //最新
		pagebtn_click(1);
	});
	pagebar_bottom.addEventListener('click', () => { //最舊
		pagebtn_click(pageitemnum);
	});
	for(let num of pagebar_nums){ //指定頁碼
		num.addEventListener('click', () => {
			pagebtn_click(num.innerText);
		});
	}
	//封包了一個導航條點擊跳轉事件.
	function pagebtn_click(pagenum = 1){
		if(pagebar.classList.contains('disable') == false){
			url.searchParams.set('page', pagenum);
			history.pushState(null,null,url);
			//pagebar_label.innerText = 'Page ' + url.searchParams.get('page') + ' of ' + pageitemnum;
			readblog(pagenum)
		}
	}

	
}

main();