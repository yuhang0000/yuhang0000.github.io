//創建一個類
class md{

  //公共變數
  static imglist = { //圖像合集
    '404':'"/Resources/UI/404.png"', //缺省的圖像連接
    'link':'"/Resources/UI/Link2.svg"', //連接
    'copy':'"/Resources/UI/Copy.svg"', //複製
    'date':'"/Resources/UI/Date2.svg"', //日期
    'updata':'"/Resources/UI/Updata2.svg"', //更新
    'tag':'"/Resources/UI/Tag.svg"', //標簽
    'uoguog':'"/Resources/UI/uoguog.svg"', //複選框: -
    'gougou':'"/Resources/UI/gougou.svg"', //複選框: v
    'nogougou':'"/Resources/UI/nogougou.svg"', //複選框: 空的
    'huaigougou':'"/Resources/UI/huaigougou.svg"', //複選框: x
  }
  static ver = 'v1.0.2.1020';
  static version = md.ver;
  static ESC = { //轉義字符
    '<':'&lt;',
    '>':'&gt;',
    '*':'&#42;',
    '~':'&#126;',
    '$':'&#36;',
    '\`':'&#96;',
  }

  //解析主循環
  //comm: data:傳遞資料 | max_code_length: 最大代碼塊摺叠長度
  static read(comm){
    //前置參數
    let starttime = new Date().valueOf(); //開始時間
    let output = []; //暫存輸出對象
    let footer = []; //追加 html 到末尾
    let datas = comm.data.trimEnd().split('\n'); //待解析的文本
    let max_code_length = '400px'; //最大代碼塊摺叠長度
    if(comm.max_code_length != null){
      max_code_length = comm.max_code_length;
    }

    //創建實例
    let dolist = new md.dolist();
    let footnote = new md.footnote();
    let table = new md. dotable();

    //元數據
    let meta = {
      'title':'',     //標題
      'date':'',      //寫作日期
      'updata':'',    //最後更新日期
      'tag':[],       //標簽
      'guest':true,   //是否公開
      'titlelist':[], //標題列表
    }
    
    //通用解析管綫
    function parseDOM1(comm){
    //return {data,type,index}; //data: 返回資訊 | type: 返回狀態 | index: 返回新的索引位置
      let data = comm.data;       //data: 傳遞資訊
      let level = comm.level;     //level: 第幾次解析
      let datas = comm.datas;     //datas: 資訊所在的數組
      let i = comm.index;         //index: 資訊所在的數組的索引位置
      let output = comm.output;   //output: 最終輸出的容器
      let encap_type = comm.type; //type: 容器封裝默認類型
      
      let data_trim = data.trim();
      if(level == 3){
        return {data:duilie(data,true)};
      }
      
      //數學公式
      if(data_trim.length == 2 && data_trim == '$$'){
        let lastindex = -1;
        let mathdiv = ['<div class="math">'];
        for(let t = i + 1 ; t < datas.length ; t++){
          let tt = datas[t];
          let ttt = tt.trim();
          if(ttt.length == 2 && ttt == '$$'){ //收尾
            lastindex = t++;
            mathdiv.push('</div>');
            break;
          }
          else{ //追加
            mathdiv.push( md.doesc(tt) );
          }
        }
        if(lastindex != -1){ //輸出
          i = lastindex;
          output.push(mathdiv.join(''));
          // continue;
          return {data:null,type:'continue',index:i};
        }
      }
      //代碼塊
      else if(data_trim.length > 2 && md.charcom(data_trim, '\`\`\`') == true){
        let lastindex = -1;
        let lang = data_trim.substring(data_trim.lastIndexOf('\`') + 1).trim();
        let codediv = ['<div class="code_block"><div class="header"><span>' + lang + '</span>' + md.uiicon('copy',['copy']) + '</div><div class="body"><code class="block" lang="' + lang + '">']
        for(let t = i + 1 ; t < datas.length ; t++){
          let tt = datas[t];
          let ttt = tt.trim();
          if(ttt.length == 3 && ttt == '\`\`\`'){ //收尾
            lastindex = t++;
            codediv.push('</code><div class="readmore disable"><span>展開更多</span></div></div></div>');
            break;
          }
          else{ //追加
            codediv.push(md.doesc(tt) + '\n');
          }
        }
        if(lastindex != -1){ //輸出
          i = lastindex;
          //output = output + codediv;
          output.push(codediv.join(''));
          // continue;
          return {data:null,type:'continue',index:i};
        }
      }
      //未建立的表哥
      else if(dolist.list_list == 0 && table.table_list.length == 0 && data_trim.length > 1 && data_trim[0] == '|' && data_trim[data_trim.length - 1] == '|'){
        let table_list = table.check(data_trim); //檢查是否為表格頭
        if(table_list.length == 0 && i + 1 < datas.length){ //如果不是, 可能是表格標題, 再向下一位查詢
          table_list = table.check(datas[i + 1]);
          if(table_list.length > 0){
            output.push('<table>');
            table.table_list = table_list;
            data = table.read(data,output,true);
          }
        }
        else if(table_list.length > 0){
          output.push('<table>');
          table.table_list = table_list;
          data = '';
        }
      }
      //已建立的表哥
      else if(table.table_list.length > 0){
        data = table.read(data,output);
      }

      //列表
      if(level == 1){
        data = dolist.read(data,output);
      }
      
      //解析隊列
      function duilie(data, skip = false){ //skip: 跳過遍歷步驟
        let data_trim = data.trim();
        let outputtemp = '';
        
        //遍歷
        if(data_trim.length > 0 && skip == false){
          let data_array = data_trim.split(' ');
          
          //分割綫
          let doline = md.doline(data_trim);
          if(doline[1] > 0){
            if(i - 1 > -1 && datas[i - 1].trim().length != 0){ //設置標題
              output[output.length - 1] = md.title(output[output.length - 1], settitle);
              return '';
            }
            else{ //或者僅設置綫段
              return doline[0];
            }
          }
          
          switch (data_trim[0]){
            case '#': //標題
              outputtemp = md.title(data);
              break;
            default: //普通文本
              //段落
              if(table.table_list.length == 0 && dolist.list_list.length == 0){ //表格, 列表尚未封包時, 先禁用
                switch (encap_type){
                  case 'LI':
                    outputtemp = md.list(data);
                    break;
                  default:
                    outputtemp = md.paragraph(data);
                    break;
                }
              }
              else{
                outputtemp = data_trim;
              }
              break;
          }
          
        }
        else if(data_trim.length > 0){ //跳過遍歷步驟之後給 outputtemp 賦值
          outputtemp = data_trim;
        }
        else{ //甚麽都木有
          return '';
        }

        if(table.table_list.length == 0 && dolist.list_list.length == 0){ //表格, 列表尚未封包時, 先禁用
          //内斂格式
          outputtemp = md.inlineformat(outputtemp);
          //處理圖像和超鏈接
          outputtemp = md.imgorlink(true, outputtemp);
          outputtemp = md.imgorlink(false, outputtemp);
          //脚注
          outputtemp = footnote.read(outputtemp);
        }

        return outputtemp;
      }
      
      //整合
      return {data:duilie(data)};
    }

    //一次解析主循環
    for(let i = 0; i < datas.length ; i++){ //每行遍历
      let data = datas[i];
      
      //檢查元數據
      if(i == 0 && data == "---"){
        //鄉下遞歸找找另一個 ---
        let lastindex = -1;
        for(let ii = 1; ii < datas.length ; ii++){
          let dataii = datas[ii].trim();
          if(dataii == ''){ //空白的不要
            continue;
          }
          if(dataii == '---'){ //道街支付了
            lastindex = ii;
            break;
          }
          let splitkey = '=';
          dataii = dataii.split(splitkey);
          if(dataii.length < 2){ //不是鍵值對説明這不是元數據
            splitkey = ':';
            dataii = dataii[0].split(splitkey); //嗯, 本身就只有一個數組
            if(dataii.length < 2){
              break;
            }
          }
          let key = dataii[0].toLowerCase(); //鍵統一小寫
          dataii.splice(0,1);
          let value = dataii.join(splitkey);

          switch (key){
            case 'title':
              meta['title'] = value;
              break;
            case 'data':
              meta['date'] = value;
              break;
            case 'updata':
              meta['updata'] = value;
              break;
            case 'tag':
              if(value.indexOf(';') != -1){
                value = value.split(';');
                for(let iii = 0 ; iii < value.length ; iii++){
                  value[iii] = value[iii].trim();
                }
                meta['tag'] = value;
              }
              else /* if(value.indexOf(',') != -1)*/{
                value = value.split(',');
                for(let iii = 0 ; iii < value.length ; iii++){
                  value[iii] = value[iii].trim();
                }
                meta['tag'] = value;
              }
              break;
            case 'guest':
              /*if(value == ''){
                meta['guest'] = true;
              }
              else{
                meta['guest'] = value;
              }*/
              switch (value.toLowerCase()){
                case 'true':
                  meta['guest'] = true;
                  break;
                case 'false':
                  meta['guest'] = false;
                  break;
                default:
                  meta['guest'] = true;
                  break;
              }
              break;
          }
        }

        if(lastindex != -1){
          i = lastindex;
          //console.table(meta);
          continue;
        }
      }

      let parse = parseDOM1({data:data,level:1,datas:datas,index:i,output:output});
      if(parse.index != null){
        i = parse.index;
      }
      if(parse.type == 'continue'){ //妥協了, 外部函數不能直接操縱内循環
        continue;
      }
      else if(parse.type == 'break'){
        break;
      }
      output.push(parse.data);
    }

    //追加文檔尾
    table.clear(footer);
    dolist.clear(footer);
    
    let header = ['<div class="header">']; //文檔頭
    if(meta['title'].length > 0){ //追加大標題
      header.push('<h1 class="header_title">' + meta['title'] + '</h1>');
    }
    else if(meta['date'].length > 0){ //標題不存在就用時間吧
      header.push('<h1 class="header_title">' + meta['date'] + '</h1>');
    }
    header.push('<div class="header_info">'); //追加信息
    if(meta['date'].length > 0){
      header.push('<div class="header_date" title="建立日期">' + md.uiicon('date',['header_icon']) + meta['date'] + '</div>');
    }
    if(meta['updata'].length > 0){
      header.push('<div class="header_lastupdata" title="更新日期">' + md.uiicon('updata',['header_icon']) + meta['updata'] + '</div>');
    }
    if(meta['tag'].length > 0 && meta['tag'][0].length > 0){
      header.push('<div class="header_tags">');
      header.push(md.uiicon('tag',['header_icon']));
      for(let tag of meta['tag']){
        header.push('<a class="header_tag_sub">' + tag + '</a>');
      }
      header.push('</div>');
    }
    header.push('</div></div>');
    if(header.length > 3){ //合并文檔頭
      output.unshift(header.join(''));
    }
    if(footer.length > 0){ //合并文檔尾
      output = output.concat(footer);
    }
    
    //輸出 HTML
    output = output.join('');
    let html = document.createElement('div');
    html.classList.add('Markdown');
    html.innerHTML = output;

    //二次解析 (列表, 引用)
    let list_li_array = []; //<li> 集合
    function dolist_list(DOM_lists){ //循環查找嵌套列表, 並返回所有 <li>
      if(DOM_lists == null){
        return;
      }
      let list_li = [];
      for(let t of DOM_lists){
        //判斷該節點是 <li> 還是 <ul><ol>
        if(t.nodeName == 'UL' || t.nodeName == 'OL' || (t.nodeName == 'DIV' && t.classList.contains("quote") == true) ){ //大寫的
          dolist_list(t.children); //嵌套
          if(list_li.length > 0){ //將 <li> 集合返回給 list_lis
            list_li_array.push(list_li);
          }
          list_li = [];
          continue;
        }
        else{
          list_li.push(t);
        }
      }
      if(list_li.length > 0){ //將 <li> 集合返回給 list_lis
        list_li_array.push(list_li);
      }
    }
    dolist_list(html.querySelectorAll('.Markdown>ol'));
    dolist_list(html.querySelectorAll('.Markdown>ul'));
    dolist_list(html.querySelectorAll('.Markdown>div.quote'));
    // debugger;
    // console.table(list_li_array);
    //二次解析主函數
    function parseDOM2(DOM_lists){
      //大循環 [[li,li,li],[p,p,p]]
      for(let DOM_list of DOM_lists){
        //小循環 [li,li,li]
        let DOMtype = DOM_list[0].nodeName; //插入節點類型
        let output = []; //暫存容器
        let datas = []; //提取的文本
        for(let t = 0 ; t < DOM_list.length ; t++){
          datas.push(DOM_list[t].innerText);
          if(t > 0){ //移除舊DOM, 僅保留第一個作爲插入點
            DOM_list[t].remove();
          }
        }
        //解析在這裏
        for(let i = 0 ; i < datas.length ; i++){ 
          let data = datas[i].trim();
          // console.log(data);
          let parse = parseDOM1({data:data,level:2,datas:datas,index:i,output:output,type:DOMtype});
          if(parse.index != null){
            i = parse.index;
          }
          if(parse.type == 'continue'){ //妥協了, 外部函數不能直接操縱内循環
            continue;
          }
          else if(parse.type == 'break'){
            break;
          }
          output.push(parse.data);
        }
        //追加至尾部
        table.clear(output);
        dolist.clear(output);
        //插入
        DOM_list[0].replaceWith(...document.createRange().createContextualFragment(output.join('')).children);
      }
    }
    parseDOM2(list_li_array);
    //三次解析主函數 (表格)
    for(let t of html.querySelectorAll('th, td')){
      let data = t.innerText;
      data = parseDOM1({data:data,level:3});
      t.innerHTML = data.data;
    }
    
    //最後加脚注
    html.appendChild(footnote.clear());
    
    //後處理: 交互
    //標題描點
    let titlelist = html.querySelectorAll('div.title');
    for(let title of titlelist){
      let text = title.lastChild.innerText;
      let level = title.lastChild.localName;
      title.setAttribute('id', text);
      let a = title.querySelector('a.title');
      a.setAttribute('href', '#' + text);
      meta['titlelist'].push([level,text]); //追加標題列表
    }
    //代碼塊 - 複製按鈕&展開按鈕&摺叠高度
    let code_block = html.querySelectorAll('div.code_block');
    for(let t of code_block){
      //摺叠高度
      let code_block = t.querySelector('code.block');
      code_block.style.maxHeight = max_code_length;
      //複製按鈕
      let btn_copy = t.querySelector('img.copy');
      btn_copy.addEventListener('click', () => {
        let code = t.querySelector('code');
        //code.select();
        //document.execCommand('copy');
        try{
          navigator.clipboard.writeText(code.innerText);
        }
        catch{
          console.error('Oops: 拷貝失敗了...');
          console.log(code.innerText);
        }
      });
      //展開按鈕
      let btn_readmore = t.querySelector('div.readmore');
      let btn_readmore_text = btn_readmore.querySelector('span')
      btn_readmore_text.addEventListener('click', () => {
        if(code_block.classList.contains('open') == true){ //收起動作
          code_block.classList.remove('open');
          code_block.style.maxHeight = max_code_length;
          btn_readmore_text.innerText = '展開更多';
          //btn_copy.scrollIntoView({behavior: 'smooth'});
          let style = getComputedStyle(t); //不能直接讀取 css 選擇器上的屬性的話, 就用這個
          window.scrollTo({ top: window.scrollY + t.getBoundingClientRect().top - parseInt(style.marginTop) - parseInt(style.marginBottom)/2, behavior: 'smooth' });
        }
        else{ //展開動作
          //code_block.style.maxHeight = 'none'; //這裏不設為 none 因爲不能使過度動畫生效;
          code_block.classList.add('open');
          code_block.style.maxHeight = code_block.scrollHeight + 'px';
          btn_readmore_text.innerText = '收起';
        }
      });
    }
    
    //console.table(meta);
    let endtime = new Date().valueOf();
    if(window.debug == true){
      console.log( '解析花費了: ' + ((endtime - starttime) / 1000 ) + ' 秒.');
    }
    return {html:html, meta:meta};
  }

  //在完成 Markdown 解析之後的后處理
  static postproc(){
    //代碼塊
    let codes = document.querySelectorAll('div.code_block');
    for(let t of codes){
      let code_block = t.querySelector('code.block');
      //是否顯示 "展開更多" btn
      if(code_block.scrollHeight > code_block.offsetHeight){
        let btn_readmore = t.querySelector('div.readmore');
        btn_readmore.classList.remove('disable');
      }
    }
  }
  
  //標題
  static title(data, level){
    let num = 0;
    let text = '';
    if(level != null && level > 0 && level < 7){
      num = level;
      text = data;
    }
    else{
      let datatemp = data.trim().split(' '); //#標題後面必須是空格
      for(let i = 0 ; i < datatemp[0].length ; i++) {
        if(datatemp[0][i] == '#'){
          num++
        }
        else{ //理論上來説, 截取的第一個字符串全是 #, 若遍歷到非 # 字符説明無效
          return md.paragraph(data);
        }
        if(num > 6){ //最大標簽為 <h6>, num 超過6個以上無效
          return md.paragraph(data);
        }
      }
      datatemp.splice(0,1); //前面的 ###### 不要
      text = datatemp.join(' '); //打這麽多注釋, 那麽這裏就凑個數吧 (看不到俺2333)
    }
    //文檔後處理
    if(text.length > 0 && md.charcom(text,'<p>') == true && md.charcom(text,'</p>',true) == true) //剔除 P 段落
    {
      text = text.substring(3,text.length - 4);
    }
    let html = '<div class="title"><a class="title"><img class="ui_icon" src=' + md.imglist['link'] + '></a><h' + num + ">" + text.trim()+ '</h' + num + '></div>';
    //H1 H2 有分割綫
    if(num < 3){
      html = html + md.line();
    }
    return html;
  }

  //普通文本
  static paragraph(data){
    /*if(data.length > 0 && data[0] == ' '){
      let data_trim = data.trimStart();
      let offset = data.length - data_trim.length;
      offset = (offset / 2).toFixed();
      return '<p style="padding-left: calc(' + offset + ' * var(--tab_margin_left));">' + data_trim + "</p>";
    }
    else{*/
      return "<p>" + data + "</p>";
    //}
  }

  //分割綫
  static line(){
    return '<div class="line"></div>';
  }

  //連接補全
  static linkfix(link){
    link = link.split('/');
    let docurl = document.location.href.split('/');
    switch (link[0]){
      case '.': //當前
        link.splice(0,1);
        docurl[docurl.length - 1] = docurl[docurl.length - 1].substring(0,docurl[docurl.length - 1].indexOf('?')); //去除末尾的問號
        return docurl.join('/') + '/' + link.join('/');
        break;
      case '..': //上一級
        //link.splice(0,1);
        let num = 0;
        for(let t of link){
          if(t == '..'){
            //link.splice(0,1);
            num++;
          }
          else{
            break;
          }
        }
        link.splice(0,num);
        if(docurl.length - num < 3){ //布利姐寫介麽多 .. 幹啥, 總之儅超過 docurl 總數時, 當作 "/" 處理
          docurl.splice(3);
        }
        else{
          docurl.splice(docurl.length - num);
        }
        return docurl.join('/') + '/' + link.join('/');
        break;
      case '': //根目錄
        docurl.splice(3);
        return docurl.join('/') + link.join('/');
        break;
      default:
        //link.splice(0,1);
        return docurl.join('/') + '/' + link.join('/');
        break;
    }
  }

  //創建列表
  static list(data, type = 1){ //傳遞資料, 有序列表的類型, 儅值為 null 時, 為無序列表, 默認值應當為1
    let html = '<li>';
    if(type == 0){ //沒有:before的無需列表
      html = '<li class="no_before">'
    }
    html = html + md.gougougou(data.trim()) + '</li>';
    return html;
  }

  //創建引用
  static quote(data, top = false , bottom = false){
    let html = '';
    if(top == true){
      html = '<div class="quote">';
    }
    html = html + data;
    if(bottom == true){
      html = html + '</div>';
    }
    return html;
  }

  //遍歷查找圖像 & 超鏈接
  static imgorlink(toimg = true, data) {
    let key;
    if(toimg == true){ //圖像與超鏈接的區別是, 圖像起始符是 '![', 而超鏈接起始符是 '['.
      key = '![';
    }
    else{
      key = '[';
    }
    
    let chartemp = [];
    let charindex = [];
    for (let t = 0 ; t < data.length ; t++){
      switch (data[t]){
        case '!':
          if(t + 1 < data.length && data[t + 1] == '[' && toimg == true){
            chartemp.push('![');
            charindex.push(t);
            t++;
          }
          break;
        case '[':
          if(toimg == false){
            chartemp.push('[');
            charindex.push(t);
          }
          break;
        case ']':
          if(t + 1 < data.length && data[t + 1] == '('){
            chartemp.push('](');
            charindex.push(t);
            t++;
          }
          break;
        case ')':
          chartemp.push(')');
          charindex.push(t);
          break;
      }
    }
    //篩選
    let chartemp2 = key;
    for(let t = 0 ; t < chartemp.length ; t++){
      switch (chartemp[t]){
        case key:
          if(chartemp[t] == chartemp2){
            chartemp2 = '](';
          }
          else{
            chartemp.splice(t,1);
            charindex.splice(t,1);
            t--;
          }
          break;
        case '](':
          if(chartemp[t] == chartemp2){
            chartemp2 = ')';
          }
          else{
            chartemp.splice(t,1);
            charindex.splice(t,1);
            t--;
          }
          break;
        case ')':
          if(chartemp[t] == chartemp2){
            chartemp2 = key;
          }
          else{
            chartemp.splice(t,1);
            charindex.splice(t,1);
            t--;
          }
          break;
      }
    }
    chartemp.splice(chartemp.length - chartemp.length % 3, chartemp.length % 3); //理論上, 總數應該是 3 的公約數
    charindex.splice(charindex.length - charindex.length % 3, charindex.length % 3);
    //合成圖像
    for(let t = chartemp.length - 1; t > -1 ; t--){
      let urltitle = data.substring(charindex[t - 1] + 2, charindex[t]).trim().split(' "');
      let url = urltitle[0];
      if(url.length == 0 || url == '"'){ //圖像失蹤了
        url = md.imglist['404'];
      }
      else{ //不全雙贏好
        if(url[0] != '"'){ 
          url = '"' + url;
        }
        if(url[url.length - 1] != '"'){
          url = url + '"';
        }
      }
      let title = '';
      if(urltitle.length > 1 && urltitle[1].length > 0){ //如果有標題
        title = ' title="' + urltitle[1];
        if(title[title.length - 1] != '"'){
          title = title + '"';
        }
      }
      let alt = data.substring(charindex[t - 2] + key.length, charindex[t - 1]);
      if(alt.length == 0){ //alt失蹤了怎麽辦呐!
        if(toimg == true){ //適用於圖像的解決方案 IMG
          if(url == md.imglist['404'] || url == '""'){
            alt = '圖像失蹤了';
          }
          else if(alt.length == 0 && urltitle.length > 1 && urltitle[1].length > 0 && urltitle[1] != '"'){
            alt = urltitle[1];
          }
          else{
            alt = url.substring(1,url.length - 1);
          }
        }
        else{ //適用於炒鷄連接的解決方案 LINK
          if(url != md.imglist['404']){
            alt = md.linkfix(url.substring(1,url.length - 1));
          }
          else{
            alt = '無效連接';
          }
        }
      }
      //生成
      let html;
      if(toimg == true){ //IMG
        html = '<img src=' + url + title + ' alt="' + alt + '">';
      }
      else{ //LINK
        if(url == md.imglist['404']){
          // url = document.location.href;
          url = "/Web/404.html";
        }
        html = '<a href=' + url + title + ' class="link" target="blank_">' + alt + '</a>';
      }
      data = data.substring(0,charindex[t - 2]) + html + data.substring(charindex[t] + 1); //合并
      t = t - 2;
    }
    return data; //輸出
  }

  //一拖拉庫的内斂格式在這裏
  static inlineformat(data){
    function doit(key,ins,doesc = false){ //關鍵詞; 插入内容; 是否轉義字符
      let html = [];
      let data_array= data.split(key); //拆分片段
      if(data_array.length < 2){ //長度不夠不符合
        return;
      }
      if(data_array.length % 2 == 0){ //為偶數時, 合并后兩項
        data_array[data_array.length - 2] = data_array[data_array.length - 2] + key + data_array[data_array.length - 1];
        data_array.splice(data_array.length - 1,1);
      }
      for(let t = 0 ; t < data_array.length ; t++){ //拼好句
        html.push(data_array[t]);
        if(t % 2 == 0 && t != data_array.length - 1){ //頭
          html.push(ins[0]);
        }
        if(t % 2 == 1){ //尾
          if(doesc == true){ //封裝尾部時先轉義字符
            html[html.length - 1] = md.doesc(html[html.length - 1]);
          }
          html.push(ins[1]);
        }
      }
      data = html.join('');
    }
    let keys = ['\`\`\`','\`\`','\`','$','***','**','*','~~'];
    let inss = ['<code>,</code>','<code>,</code>','<code>,</code>','<span class="math">,</span>','<b><i>,</i></b>','<b>,</b>','<i>,</i>','<del>,</del>'];
    let doescs = [true,true,true,true,false,false,false,false];
    for(let t = 0 ; t < keys.length ; t++){ //遍歷
      doit(keys[t], inss[t].split(','), doescs[t]);
    }
    return data;
  }

  //那個大狗狗
  static gougougou(data){
    //data = data.trim(); //在列表執行到這裏之前, trim 已經執行過一次了
    if(data.length > 3 && data[0] == '[' && data[2] == ']' && data[3] == ' '){
      switch(data[1]){
        case ' ':
          return md.checkboxicon() + data.substring(4);
        case 'x':
          return md.checkboxicon('v') + data.substring(4);
        default:
          return data;
      }
    }
    else{
      return data;
    }
  }

  //狗狗合集
  static checkboxicon(style = ''){
    switch(style){
      case 'x':
        return md.uiicon('huaigougou', ['gougou']);
      case 'v':
        return md.uiicon('gougou', ['gougou']);
      case '-':
        return md.uiicon('uoguog', ['gougou']);
      default:
        return md.uiicon('nogougou', ['gougou']);
    }
  }

  //脚注
  static footnote = class{
    constructor(){
      this.footnote_list = [];
    }
    //重置
    clear(){
      let dom = document.createElement('ol');
      dom.classList.add('footnotelist');
      dom.innerHTML = this.footnote_list.join('');
      if(this.footnote_list.length == 0){ //如果沒有脚注的話, 就把容器給隱藏了
        dom.style.display = 'none';
      }
      this.footnote_list = [];
      return dom;
    }
    //讀取
    read(data){
      let foot = [];
      let data_trim = data.trim();
      
      let tempdump = []; //暫存索引
      let tempdump2 = []; //暫存符號
      if(data_trim.length > 0){
        //先便利
        for(let i = 0 ; i < data_trim.length ; i++){
          switch(data_trim[i]){
            case '[':
              if(i + 1 < data_trim.length && data_trim[i + 1] == '^'){
                tempdump.push(i);
                tempdump2.push('[^');
                i++;
              }
              break;
            case ']':
              if(i + 1 < data_trim.length && data_trim[i + 1] == ':'){ //脚注頭
                tempdump.push(i);
                tempdump2.push(']:');
                i++;
              }
              else{
                tempdump.push(i);
                tempdump2.push(']');
              }
              break;
          }
        }
        //篩選
        let tempkey = ']';
        for(let i = 0 ; i < tempdump.length ; i++){
          switch(tempdump2[i]){
            case '[^':
              if(tempkey == ']'){
                tempkey = '[^';
              }
              else{
                tempdump.splice(i,1);
              }
              break;
            case ']':
              if(tempkey == '[^'){
                tempkey = ']';
              }
              else{
                tempdump.splice(i,1);
              }
              break;
            case ']:': //脚注頭
              if(tempkey == '[^'){
                let note = data_trim.substring(tempdump[i - 1] + 2, tempdump[i]); //截取關鍵詞
                this.footnote_list.push('<li class="footnotesub" id="' + note + '"><b>' + note + '</b>: ' + data_trim.substring(tempdump[i] + 2, data_trim.lastIndexOf('</p>')).trim() + '</li>');
                return ''; //暫存到脚注列表, 直接返回空字符
              }
          }
        }
        tempdump.splice(tempdump.length - tempdump.length % 2, tempdump.length % 2);
        tempdump2.splice(tempdump2.length - tempdump2.length % 2, tempdump2.length % 2);
        //開始
        for(let i = tempdump.length - 1 ; i > -1 ; i--){
          let note = data_trim.substring(tempdump[i - 1] + 2, tempdump[i]); //截取關鍵詞
          data = data_trim.substring(0,tempdump[i - 1]) + '<a class="footnote" href="#' + note + '">' + note + '</a>' + data_trim.substring(tempdump[i] + 1);
          i--;
        }
      }
        
      return data
    }
  }

  //HELP!!!
  static help_old(key){
    let help = [];
    help.push('%c適用於 Web 環境的 Markdown 解析器 ' + md.ver);
    help.push('By: yuhang0000');
    help.push('');
    help.push('ver: 列印版本號');
    help.push('read(data): 解析 Markdown 文檔 | data: 傳遞資料');
    help.push('title(data, level): 輸出標題 | data: 傳遞資料; level: 標題等級, 默認爲空');
    help.push('paragraph(data): 輸出 <p> 段落 | data: 傳遞資料');
    help.push('line(): 輸出分割綫');
    help.push('linkfix(link): 補全連接 | link: 輸入連接');
    help.push('               舉個栗子: 當前頁面路徑為 http://localhost/Home/Web/Blog/Index.html');
    help.push('                         # 輸入 "/Test.md" 返回 "http://localhost/Test.md" ');
    help.push('                         # 輸入 "./Test.md" 返回 "http://localhost/Home/Web/Blog/Test.md" ');
    help.push('                         # 輸入 "../Test.md" 返回 "http://localhost/Home/Web/Test.md" ');
    help.push('                         # 輸入 "../../Test.md" 返回 "http://localhost/Home/Test.md" ');
    help.push('list(data, top, bottom, type): 用於創捷有序列表和無序列表 | data: 傳遞資料; top: 附加頭 <ul>, 默認為 false; bottom: 附加尾 </ul>, 默認為 false; type: 有序列表的類型, 儅值為 null 時, 為無序列表, 默認值應當為1');
    help.push('quote(data, top, bottom, type): 用於創捷引用塊 | data: 傳遞資料; top: 附加頭, 默認為 false; bottom: 附加尾, 默認為 false');
    help.push('inlineformat(data): 解析並輸出内斂格式的文本 | data: 傳遞資料');
    help.push('gougougou(data): 解析並輸出任務列表 | data: 傳遞資料');
    help.push('checkboxicon(style): 輸出複選框圖標 | style: 複選框類型, 可選 " " "-" "v" "x", 默認為 " "');
    help.push('footnote(data, footnotelist): 解析並輸出脚注或脚注列表 | data: 傳遞資料; footnotelist: 傳遞脚注清單');
    help.push('getoffset(data): 給列表用的, 用於計算偏移值並返回列表類型組 | data: 傳遞資料; | 返回數組: 列表類型, 截取后資料');
    help.push('charcom(data, key, end): 用於比較字符串 | data: 傳遞資料; key: 關鍵詞; end: 從尾開始, 默認爲 false; | 返回 布爾值');
    help.push('uiicon(type, classlist): 輸出圖標 | type: 圖標類型; classlist: 附加 class 屬性');
    help.push('doesc(data): 用於轉移字符串 | data: 傳遞資料');
    help.push('help(): 列印此幫助');
    console.log(help.join('\n'),'color: #0f5290');
  }

  //HELP!!!
  static help(key){
    //存放文本樣式
    let style = {
      text: 'color: #0f5290;',
      title: 'color: #0f5290; font-weight: bold;',
      code_header: 'font-size: 0.8em; padding: 4px; background: #ddd; border-bottom: 1px solid #ccc; border-radius: 4px 4px 0px 0px;',
      code_body: '',
    }
    
    function lite(){
      console.log('%c適用於 Web 環境的 Markdown 解析器 ' + md.ver + '\n' +
`By: yuhang0000

%c快速上手:
%cmd.read({` + "data:'Text'" + `});

%c説明:
%c傳遞 Markdown 資訊, 並轉化爲可讀的 HTML 文檔.

%c使用案例:
%cjs
%clet text = '**Hello World!!!**';
let result = md.read(data:text);
let HTML = result.html;
document.body.appendChild(a);
md.postproc();`
      ,style.text,style.title,style.text,style.title,style.text,style.title,style.text);
    }

    //調用  
    if(key == null){ //默認文檔
      lite();
      return '';
    }
    else{ //詳細文檔
      
    }
    
  }

  //給列表計算偏移值的
  static getoffset(data){
    if(data == null || data.length < 1){
      return [ [], data ]
    }
    data = data.trimEnd().split(' ');
    let num = 0; //用來給 "無序列表並無 :before" 計數的
    let type = []; //列表類型
    let howlong = 0; //向前裁切多少數組
    for(let t of data){
      if(t == ''){ //無序列表並無 :before
        num++;
      }
      else if(t == '-' || t == '*'){ //無序列表
        type.push(1);
      }
      else if(t.length > 1 && t[t.length - 1] == '.' && isNaN(t) == false){ //有序列表
        type.push(2);
      }
      else if(t == '>'){
        type.push(3);
      }
      else{
        break;
      }
      howlong++;
    }
    data.splice(0,howlong);
    data = data.join(' ');
    //追加 "無序列表並無 :before"
    for(let t = 0 ; t < Math.round(num / 2) ; t++){
      type.unshift(0);
    }
    return [ type, data ];
  }

  //比較字符
  static charcom(data, key, end = false) { //傳遞數據; 比較數據; 前&后
    if(key.length > data.length){ //被比較對象比關鍵詞小就直接 Pass 掉
      return false;
    }
    if(end == false){ //前
      for(let t = 0 ; t < key.length ; t++){
        if(data[t] != key[t]){
          return false;
        }
      }
    }
    else{ //后
      for(let t = 1 ; t < key.length + 1; t++){
        if(data[data.length - t] != key[key.length - t]){
          return false;
        }
      }
    }
    return true;
  }

  //圖標
  static uiicon(type, classlist){ //圖標類型; 附加 class 屬性
    let src = md.imglist[type];
    if(src == null){
      src = md.imglist['404'];
    }
    if(classlist.length > 0){
      classlist = ' ' + classlist.join(' '); 
    }
    else{
      classlist = '';
    }
    return '<img class="ui_icon' + classlist + '" src=' + src + '>';
  }

  //轉移字符
  static doesc(data){
    let keys = Object.keys(md.ESC)
    for(let key of keys){
      // while(data.indexOf(key) != -1){
      //   data = data.replace(key, md.ESC[key]);
      // }
      data = data.split(key).join(md.ESC[key]);
    }
    return data;
  }

  //分割线
  static doline(data){
    let firstcham = data.trim()[0];
    if(firstcham == '=' || firstcham == '-' || firstcham == '*' || firstcham == '_'){
      let num = 0;
      let settitle = 0; //标题等級
      let data_nospace = data.split(' ').join('');
      if(data_nospace.length > 2){
        switch (firstcham){ //設置標題等級
          case '=':
            settitle = 1;
            break
          case '-':
            settitle = 2;
            break
        }
        for(let t of data_nospace){ //直接合并空格, 畢竟 * * * 這類也算分割綫
          if(t == firstcham){
            num++;
          }
          else{
            num = 0;
            break;
          }
        }
      }
      //輸出
      if(num > 2){
        return [md.line(), settitle];
      }
      else{
        return [data, -1]; //-1: 不是綫 | 0: 就是綫 | 1: 不僅是綫, 還是一級標題 | 2: 不僅是綫, 居然還是二級標題
      }
    }
    else{
      return [data, -1];
    }
  }

  //讀取列表
  static dolist = class {
    //屬性
    constructor() {
      this.list_type = []; //暫存列表類型
      this.list_list = []; //追加 html 到末尾
    }
    
    //直接封包, 重置暫存
    clear(output){
      if(this.list_type.length > 0){ 
        for(let t = this.list_list.length - 1 ; t > -1 ; t--){
          output.push(this.list_list[t]);
        }
        this.list_type = [];
        this.list_list = [];
      }
    }

    //讀取
    read(data,output){
      //跳過空行
      if(data == null || data.trim().length == 0){
        // this.clear(output);
        return data;
      }
      let type = md.getoffset(data); //返回 type 列表和已修剪 data
      //非列表
      if(type[0].length == 0 || (this.list_type.length == 0 && Math.max(...type[0]) == 0) ){
        this.clear(output);
        return data;
      }
      //繼續
      data = type[1];
      type = type[0];
      let html = []; //暫存容器
      let ins = 0; //插入點
      for(let t of type){ //尋找插入點
        if(ins > this.list_type.length - 1){
          break;
        }
        // if(t + this.list_type[ins] == 3){
        // if(t != this.list_type[ins] && !(t ** 2 < 2 && this.list_type[ins] ** 2 < 2) ){ //冪函數居然不是 ^, 用上 ! 來表否定
        if(!(t == 0 || this.list_type[ins] == 0 || t == this.list_type[ins])){
          break;
        }
        ins++;
      }
      //封包舊的
      for( let t = 0 ; t < this.list_list.length - ins ; t++){
        html.push(this.list_list[t]);
      }
      //更新 array
      this.list_list.splice(0, this.list_list.length - ins);
      this.list_type.splice(ins);
      for(let t = ins ; t < type.length ; t++){
        this.list_type.push(type[t]);
      }
      //修飾文本
      if(type.length > 0 && type[type.length - 1] == 3){ //對於引用
        if(data.length == 0){ //如果截取后長度為 0, 就不要了
          data = ''
        }
        else{
          data = md.paragraph(data);
        }
      }
      else{ //對於列表
        data = md.list(data,type[type.length - 1]);
      }
      //追加列表頭
      for(let t = ins ; t < type.length ; t++){
        switch (type[t]){
          case 2: //有序列表
            if(t > 0 && type[t - 1] == 0){ //列表嵌套時, 應該要隱藏 :before
              html.push('<ol class="no_before">');
            }
            else{
              html.push('<ol>');
            }
            this.list_list.unshift('</ol>');
            break;
          case 3: //引用
            if(t > 0 && type[t - 1] == 0){ //列表嵌套時, 應該要隱藏 :before
              html.push('<div class="quote no_before">');
            }
            else{
              html.push('<div class="quote">');
            }
            this.list_list.unshift('</div>');
            break;
          default: //無序列表
            if(t > 0 && type[t - 1] == 0){ //列表嵌套時, 應該要隱藏 :before
              html.push('<ul class="no_before">');
            }
            else{
              html.push('<ul>');
            }
            this.list_list.unshift('</ul>');
            break;
        }
      }
      //輸出
      html.push(data);
      return html.join('');
    }
    
  };

  //讀取引用 (棄用)
  static quote = class{
    //屬性
    constructor() {
      this.quote_list = [];
    }
    
    //復位
    clear(output){
      for(let t of this.quote_list){
        output.push(t);
      }
      this.quote_list = [];
    }
    
    //讀取
    read(data,output){
      //跳過空行
      if(data == null || data.trim().length == 0){
        return data;
      }
      //檢查有多少個 '>'
      let offset = 0;
      let data_array = data.split(' ');
      if(data_array.length < 2){ //分段不夠, 跳過
        this.clear(output);
        return data;
      }
      for(let t of data_array){
        if(t == '>'){
          offset++;
        }
        else{
          break;
        }
      }
      if(offset < 1){ //偏移量不夠, 跳過
        this.clear(output);
        return data;
      }
      
      //截取後面的文本, 並設置爲 P 段落
      // data_array.splice(0, offset);
      data = data_array.splice(offset).join(' ');
      if(data.length == 0){ //如果截取后長度為 0, 就不要了
        data_array = [''];
      }
      else{
        data_array = ['<p>' + data + '</p>'];
      }
      
      //升級
      if(offset > this.quote_list.length){
        for(let t = 0 ; t < offset - this.quote_list.length ; t++){
          // output.push('<div class="quote">');
          data_array.unshift('<div class="quote">');
          this.quote_list.push('</div>');
        }
      }
      //降級
      else if(offset < this.quote_list.length){
        // output.push(this.quote_list.splice(0, this.quote_list.length - offset).join(''));
        data_array.unshift(this.quote_list.splice(0, this.quote_list.length - offset).join(''));
      }
      //輸出
      return data_array.join('');
    }
  }

  //读取表格
  static dotable = class{
    //屬性
    constructor() {
      this.table_list = []; //暫存每列對其方向, 也可以代指縂列數
    }

    //清理, 復位
    clear(output){
      this.table_list = [];
      output.push('</table>');
    }

    //檢查是不是表格頭 |---|
    check(data){
      let list = [];
      data = data.trim();
      if(data[0] != '|' || data[data.length - 1] != '|'){ //每行前後必須是 '|'
        return [];
      }
      let data_array = data.split('|');
      // data_array.splice(0,1); //去頭
      // data_array.splice(data_array.length - 1,1); //去尾
      data_array.shift(); //去頭
      data_array.pop(); //去尾
      //遍歷
      for(let t of data_array){ //拆項
        t = t.trim();
        if(t.length < 3){ //最小也得是 '---'
          return [];
        }
        //對其方向
        let fangxiang = 'l'; //默認左對齊
        if(t[0] == ':'){ //頭
          fangxiang = 'l';
          if(t[t.length - 1] == ':'){ //頭&尾
            fangxiang = 'c';
          }
        }
        else if(t[t.length - 1] == ':'){ //尾
          fangxiang = 'r';
        }
        list.push(fangxiang);
        let num = 0; //計算有多少個 '---'
        for(let tt of t){ //拆字
          if(tt == '-'){
            num++
          }
          else if(tt != ':'){ //既不是 '-' 也不是 ':'
            return [];
          }
        }
        if(num < 3){ // '-' 的數量不超過3
          return [];
        }
      }
      return list; //返回每列對其方向, 儅 length 為 0 時, 説明不是表格1
    }

    //解析
    read(data,output,type){
      let data_trim = data.trim();
      let table_list = this.check(data);
      if(table_list.length > 0){ //判斷 data 是否為表格頭
        if(this.table_list.length == 0){ //如果 this.table_list 為空, 就補上
          this.table_list.length = table_list;
          output.push('<table>');
        }
        return '';
      }
      else if(this.table_list.length == 0 || data_trim.length < 1 || (data_trim[0] != '|' || data_trim[data_trim.length - 1] != '|') ){ //非表格
        this.clear(output);
        return data;
      }
      
      let subhtml = ['<th class="','">','</th>']; //標題
      if(type != true){
        subhtml = ['<td class="','">','</td>']; //項目
      }
      
      let html = ['<tr>']; //暫存容器
      let data_array = data_trim.split('|'); //行拆項
      data_array.shift();
      data_array.pop();
      if(this.table_list.length > data_array.length){ //儅子項比列表頭少時, 填充空白
        for(let t = 0 ; t < this.table_list.length - data_array.length ; t++){
          data_array.push('');
        }
      }
      for(let t = 0 ; t < this.table_list.length ; t++){ //this.table_list.length 比 data_array.length 好, 儅子項比列表頭多時, 直接截斷
        let tt = data_array[t].trim();
        this.addsub(tt,this.table_list[t],html,subhtml); //追加項
      }
      html.push('</tr>');
      return html.join('');
    }

    //添加項
    addsub(data,dir,html,subhtml){ //文本, 方向, 容器, 子項封裝頭和尾
      html.push(subhtml[0] + dir + subhtml[1] + data + subhtml[2]);
    }
  }

}

//嘗試兼容 web.archive.org, 因爲在該網站拍攝的快照, 其保存的每份js脚本均會二次封裝一層 if 函數, 導致 class 轉成局部變數.
window.md = md;

//TODO:
//幫助主題
//數學公式的解析
//CSharp 和 JS 的解析
//流程圖的解析