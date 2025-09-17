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
  static ver = 'v0.0.6.0916';
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
  static read(datas){
    let output = []; //暫存輸出對象
    let footnotelist = []; //暫存脚注
    let offset_quote = 0; //暫存引用偏移量
    datas = datas.trim().split('\n');

    //元數據
    /*let title; //標題
    let data; //寫作日期
    let updata; //最後更新日期
    let tag; //標簽
    let guest = true; //是否公開*/
    let meta = { 'title':'', //標題
    'date':'', //寫作日期
    'updata':'', //最後更新日期
    'tag':[], //標簽
    'guest':true, //是否公開
    'titlelist':[], //標題列表
    }
    
    //console.log(datas);
    for(let i = 0; i < datas.length ; i++){ //每行遍历
      let data = datas[i];
      //let outputtemp = ''
      //console.log(data);

      
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

      //數學公式或代碼塊
      let data_trim = data.trim();
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
          //output = output + mathdiv;
          output.push(mathdiv.join(''));
          continue;
        }
      }
      else if(data_trim.length > 2 && md.charcom(data_trim, '\`\`\`') == true){ //CODE
        let lastindex = -1;
        let lang = data_trim.substring(data_trim.lastIndexOf('\`') + 1).trim();
        let codediv = ['<div class="code_block"><div><span>' + lang + '</span>' + md.uiicon('copy',['copy']) + '</div><code class="block" lang="' + lang + '">']
        for(let t = i + 1 ; t < datas.length ; t++){
          let tt = datas[t];
          let ttt = tt.trim();
          if(ttt.length == 3 && ttt == '\`\`\`'){ //收尾
            lastindex = t++;
            codediv.push('</code></div>');
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
          continue;
        }
      }

      //引用
      if(data_trim.length > 0 && data_trim[0] == '>'){
        let num = 0; //計數
        let padding_left = data.length - data.trimStart().length;
        let data_array = data_trim.split(' ');
        for(let t of data_array){
          if(t == '>'){
            num++;
          }
          else{
            break;
          }
        }
        //裁剪前面
        data_array.splice(0,num);
        data = data_trim = data_array.join(' ');
        
        if(num > offset_quote){ //升級
          for(let t = 0 ; t < num - offset_quote ; t++){
            if(padding_left > 0 && offset_quote == 0){ //向左位移
              output.push('<div class="quote" style="margin-left: calc(' + Math.trunc(padding_left / 2) + ' * var(--list_margin_left))">');
            }
            else{
              output.push('<div class="quote">');
            }
          }
        }
        else if(num < offset_quote){ //降級
          for(let t = 0 ; t < offset_quote - num ; t++){
            output.push('</div>');
          }
        }
        offset_quote = num;
      }
      else if(offset_quote > 0){ //對引用塊封包
        for(let t = 0 ; t < offset_quote ; t++){
            output.push('</div>');
        }
        offset_quote = 0;
      }

      //表哥
      if(data_trim.length > 4 && data_trim[0] == '|' && data_trim[data_trim.length - 1] == '|'){
        let LCR = []; //暫存列對齊方式
        let tablesplit = data_trim.split('|'); //拆分單元格
        tablesplit.splice(0,1); //頭和尾為空的, 移除
        tablesplit.splice(tablesplit.length - 1,1);
        //解析對齊方式
        for(let t of tablesplit){
          t = t.trim();
          let num = 0;
          let ddd = ''; //暫存對其方位
          for(let tt of t){ //逐字解析
            if(num == 0 && tt == ':'){
              ddd = 'l'; //左對其
            }
            else if(tt == ':'){
              if(ddd == 'l'){
                ddd = 'c'; //中對其
              }
              else{
                ddd = 'r'; //右對其
              }
            }
            else if(tt == '-'){
              num++;
            }
            else{
              num = -1;
              break;
            }
          }
          if(num < 3){ //這不是我表哥
            LCR = [];
            break;
          }
          else{
            if(ddd == ''){
              ddd = 'l'
            }
            LCR.push(ddd);
          }
        }
        //開始解析
        if(LCR.length > 0){
          //debugger;
          let html = '<table>'; //表哥容器
          let tableheader = ''; //表哥頭兒
          let tablesub = []; //表哥兄弟
          //封裝
          function readtable(data, head = false){ //傳遞資料, 是否為表頭
            let html = ['<tr>'];
            let key = ['<td class="','</td>'];
            if(head == true){ //為表頭
              key = ['<th class="','</th>'];
              html = ['<tr class="header">'];
            }
            //if(data.length > 4 && data[0] == '|' && data[data.length - 1] == '|'){
              data = data.split('|');
              data.splice(0,1);
              data.splice(data.length - 1,1);
              for(let t = 0 ; t < data.length ; t++){
                if(t > LCR.length - 1){ //超過列數就終止
                  break;
                }
                html.push(key[0] + LCR[t] + '">' + duilie(data[t], true) + key[1]);
              }
              if(data.length < LCR.length){ //列數不夠就往後補
                for(let t = 0 ; t < LCR.length - data.length ; t++){
                  html.push(key[0] + 'l">' + key[1]);
                }
              }
            //}
            html.push('</tr>');
            return html.join('');
          }
          //唉... 用來截取 '>' 之後字符的
          function quote(data){
            let num = 0;
            data = data.split(' ');
            for(let t of data){
              if(t == '>'){
                num++;
              }
              else{
                break;
              }
            }
            data.splice(0,num);
            return [data.join(' '), num];
          }
          //檢查表頭
          if(output.length > 0){
            let offset = 0;
            let header = datas[i - 1].trim();
            if(offset_quote > 0){ //儅存在引用塊偏移值時
              header = quote(header);
              offset = header[1];
              header = header[0];
            }
            if(offset == offset_quote && header.length > 4 && header[0] == '|' && header[header.length - 1] == '|'){
              tableheader = readtable((header), true);
            }
          }
          //向下遍歷
          let lastindex = i + 1;
          for(let t = i + 1 ; t < datas.length ; t++){
            let offset = 0;
            let subdata = datas[t].trim();
            if(offset_quote > 0){ //儅存在引用塊偏移值時
              subdata = quote(subdata);
              offset = subdata[1];
              subdata = subdata[0];
            }
            if(offset == offset_quote && subdata.length > 4 && subdata[0] == '|' && subdata[subdata.length - 1] == '|'){
              tablesub.push(readtable(subdata));
            }
            else{ //遍歷到非表哥就終止
              lastindex = t - 1;
              break;
            }
          }
          //收尾
          i = lastindex;
          if(output.length > 0){
            output[output.length - 1] = html + tableheader + tablesub.join('') + '</table>';
          }
          else{
            output.push(html + tableheader + tablesub.join('') + '</table>');
          }
          //debugger;
          continue;
        }
      }
      
      //解析隊列
      function duilie(data, skip = false){ //skip: 跳過遍歷步驟
        let data_trim = data.trim();
        let outputtemp = '';
        
        //遍歷
        if(data_trim.length > 0 && skip == false){
          let data_array = data_trim.split(' ');
          let firstcham = data_trim[0]; //取首個字符
          
          //分割綫
          if(firstcham == '=' || firstcham == '-' || firstcham == '*' || firstcham == '_'){
            let num = 0;
            let settitle = 0; //标题等級
            let data_nospace = data_array.join('');
            if(data_nospace.length > 2){
              switch (firstcham){ //設置標題等級
                case '=':
                  settitle = 1;
                  break
                case '-':
                  settitle = 2;
                  break
              }
              for(let t of data_array.join('')){ //直接合并空格, 畢竟 * * * 這類也算分割綫
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
              if(settitle > 0 && output.length > 0 && datas[i - 1].trim().length != 0){ //設置標題
                output[output.length - 1] = md.title(output[output.length - 1], settitle);
                return '';
              }
              else{
                return md.line();
              }
            }
          }
          
          switch (firstcham){
            case '#': //標題
              outputtemp = md.title(data);
              break;
            case '*': //列表
              outputtemp = dolist();
              break;
            case '-': //还是列表
              outputtemp = dolist();
              break;
            default: //普通文本
              if(data_trim.indexOf('.') != -1 && isNaN( data_trim.substring(0, data_trim.indexOf('.')) ) == false){ //有序列表
                outputtemp = dolist();
              }
              else{ //段落
                outputtemp = md.paragraph(data);
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
        
        //内斂格式
        outputtemp = md.inlineformat(outputtemp);
  
        //處理圖像和超鏈接
        outputtemp = md.imgorlink(true, outputtemp);
        outputtemp = md.imgorlink(false, outputtemp);

        //脚注
        outputtemp = md.footnote(outputtemp, footnotelist);

        return outputtemp;
      }

      //列表
      function dolist(){
        let offset_list = []; //存儲標簽頭 (要麽 <ul> 要麽 <ol>)
        //跳過非列表 (强迫症害死人)
        let data1 = data_trim.indexOf(' ');
        if(data1 != -1){
          data1 = data_trim.substring(0,data_trim.indexOf(' '));
        }
        else{
          data1 = data_trim;
        }
        if(data1 != '-' && data1 != '*' && (data1[data1.length - 1] != '.' || isNaN(data1) == true) ){ 
          return md.paragraph(data);
        }
        
        //向下遍歷
        let html = [];
        for(let t = i ; t < datas.length ; t++){
          let data = datas[t];
          if(data.trim().length == 0){ //跳過空行
            continue;
          }

          //如果 offset_quote > 0
          if(offset_quote > 0){
            data = data.substring(offset_quote * 2);
          }
          
          //查找偏移值
          let offset = md.getoffset(data); //偏移量
          let type = offset[1];
          data = offset[2];
          offset = offset[0];
          
          if(offset_list.length < offset){ //升級
            let num = offset - offset_list.length;
            for(let tt = 0 ; tt < num ; tt++){
              if(tt + 1 != num){ //前面缺省為 <ul>
                html.push('<ul>');
                offset_list.push(null);
              }
              else{
                if(type == null){
                  html.push('<ul>');
                }
                else{
                  html.push('<ol>');
                }
                offset_list.push(type);
              }
            }
          }
          if(offset_list.length > offset){ //降級
            let num = offset_list.length - offset;
            for(let tt = 0 ; tt < num ; tt++){
              if(offset_list[offset_list.length - 1] == null){ //取最後一個 type, 然後封包
                html.push('</ul>');
                offset_list.splice(offset_list.length - 1, 1);
              }
              else{
                html.push('</ol>');
                offset_list.splice(offset_list.length - 1, 1);
              }
            }
          }
          if(offset == 0){ //偏移值為 0 時終止循環
            //i = t - 1;
            break;
          }
          else{ //追加在這裏
            //在追加之前, 先檢查該列表與上一個列表為同一類型
            if(type != offset_list[offset_list.length - 1]){
              if(offset_list[offset_list.length - 1] == null){
                html.push('</ul>');
                html.push('<ol>');
                offset_list[offset_list.length - 1] = type;
              }
              else{
                html.push('</ol>');
                html.push('<ul>');
                offset_list[offset_list.length - 1] = type;
              }
            }
            i = t;
            html.push( md.list( duilie(data, true), false, false, type ) );
          }
        }
        
        //執行到此處説明運行到底部
        return html.join('');
      }
      
      //整合
      output.push(duilie(data));
    }

    if(footnotelist.length > 0){ //追加脚注
      let footnotehtml = '<ol class="footnotelist">' + footnotelist.join('') + '</ol>';
      output.push(footnotehtml);
    }
    
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
    
    //輸出 HTML
    output = output.join('');

    //後處理: 交互
    let html = document.createElement('div');
    html.classList.add('Markdown');
    html.innerHTML = output;
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
    //代碼塊的複製按鈕
    let code_block = html.querySelectorAll('div.code_block');
    for(let t of code_block){
      let btn = t.querySelector('img.copy');
      btn.addEventListener('click', () => {
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
    }
    
    //console.table(meta);
    return [html, meta];
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
    return "<p>" + data + "</p>";
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
      case '.':
        link.splice(0,1);
        return docurl.join('/') + '/' + link.join('/');
        break;
      case '..':
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
      case '':
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
  static list(data, top = false , bottom = false , type = null){ //傳遞資料, 附加頭 <ul>, 附加尾 </ul>, 有序列表的類型, 儅值為 null 時, 為無序列表, 默認值應當為1
    let ulorol;
    if(type == null){ //無序列表
      ulorol = ['<ul>','</ul>'];
    }
    else{ //有序列表
      type = String(type);
      if(['A','a','I','i'].indexOf(type) == -1){
        type = '';
      }
      else{
        type = ' type="' + type + '"';
      }
      ulorol = ['<ol' + type + '>','</ol>'];
    }

    let html = '<li>';
    if(top == true){ //追加頭部
      html = ulorol[0] + '<li>';
    }
    // html = html + data.trim().substring(2) + '</li>';
    //data = data.trim().split(' ');
    //data.splice(0,1);
    //html = html + md.gougougou(data.join(' ')) + '</li>';
    html = html + md.gougougou(data.trim()) + '</li>';
    if(bottom == true){ //追加尾部
      html = html + ulorol[1];
    }
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
  static footnote(data, footnotelist){
    let foot = [];
    let data_trim = data.trim();

    //先判斷是不是 [^]:
    /*if(data_trim.length > 0 && data_trim[0] == '[' && data_trim[1] == '^'){
      let lastindex = -1;
      for(let i = 0 ; i < data_trim.length ; i++){
        if(i + 1 < data_trim.length && data_trim[i] == ']' && data_trim[i + 1] == ':'){
          let note = data_trim.substring(2, i); //截取關鍵詞
          footnotelist.push('<p class="footnotesub" name="' + note + '">' + data_trim.substring(i + 2) + '</p>');
          return '';
        }
      }
    }*/

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
              footnotelist.push('<li class="footnotesub" id="' + note + '"><b>' + note + '</b>: ' + data_trim.substring(tempdump[i] + 2, data_trim.lastIndexOf('</p>')).trim() + '</li>');
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

  //HELP!!!
  static help(){
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
    help.push('getoffset(data): 給列表用的, 用於計算偏移值 | data: 傳遞資料; | 返回數組: 偏移值, 列表類型, 截取后資料');
    help.push('charcom(data, key, end): 用於比較字符串 | data: 傳遞資料; key: 關鍵詞; end: 從尾開始, 默認爲 false; | 返回 布爾值');
    help.push('uiicon(type, classlist): 輸出圖標 | type: 圖標類型; classlist: 附加 class 屬性');
    help.push('doesc(data): 用於轉移字符串 | data: 傳遞資料');
    help.push('help(): 列印此幫助');
    console.log(help.join('\n'),'color: #0f5290');
  }

  //給列表計算偏移值的
  static getoffset(data){
    data = data.split(' ');
    let num = 0;
    let type = 'none'; //列表類型
    let howlong = 0; //向前裁切多少數組
    for(let t of data){
      if(t == ''){
        num++;
      }
      else if(t == '-' || t == '*'){
        num = num + 2;
        type = null;
      }
      else if(t[t.length - 1] == '.' && isNaN(t) == false){
        num = num + 2;
        type = 1;
      }
      else{ //截至
        break;
      }
      howlong++;
    }
    if(type == 'none'){ //沒有返回任何類型, 為非列表
      num = 0;
    }
    data.splice(0, howlong);
    // num = num / 2;
    // if(num.indexOf('.') != -1){ //去除小數點
    //   num = num.substring(0, num.indexOf('.'));
    // }
    return [ Math.trunc(num / 2), type, data.join(' ')]; //偏移值, 列表類型, 截取后數據
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
  
}

//TODO:
//幫助主題
//數學公式的解析
//CSharp 和 JS 的解析
//流程圖的解析