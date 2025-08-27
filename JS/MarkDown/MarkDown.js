//創建一個類
class md{

  //公共變數
  static img404 = '"/Res/UI/404.png"'; //缺省的圖像連接
  static ver = 'v0.0.1.0827';
  static version = md.ver;

  //解析主循環
  static read(datas){
    let output = ''; //暫存輸出對象
    datas = datas.trim().split('\n');

    //元數據
    /*let title; //標題
    let data; //寫作日期
    let updata; //最後更新日期
    let tag; //標簽
    let guest = true; //是否公開*/
    let meta = { 'title':'', //標題
    'data':'', //寫作日期
    'updata':'', //最後更新日期
    'tag':'', //標簽
    'guest':true /*是否公開*/ }
    
    //console.log(datas);
    for(let i = 0; i < datas.length ; i++){ //每行遍历
      let data = datas[i];
      let outputtemp = ''
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
          dataii = dataii.split('=');
          if(dataii.length < 2){ //不是鍵值對説明這不是元數據
            break;
          }
          let key = dataii[0].toLowerCase(); //鍵統一小寫
          dataii.splice(0,1);
          let value = dataii.join('=');

          switch (key){
            case 'title':
              meta['title'] = value;
              break;
            case 'data':
              meta['data'] = value;
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
        let mathdiv = '<div class="math">'
        for(let t = i + 1 ; t < datas.length ; t++){
          let tt = datas[t];
          let ttt = tt.trim();
          if(ttt.length == 2 && ttt == '$$'){
            lastindex = t++;
            mathdiv = mathdiv + '</div>';
            break;
          }
          else{
            mathdiv = mathdiv + tt;
          }
        }
        if(lastindex != -1){
          i = lastindex;
          output = output + mathdiv;
          continue;
        }
      }
      else if(data_trim.length > 2 && data_trim[0] == '\`' && data_trim[1] == '\`' && data_trim[2] == '\`'){
        let lastindex = -1;
        let lang = data_trim.substring(3).trim();
        let codediv = '<div class="code_block"><div><span>CSharp</span><img src="/Resources/UI/Copy-G.svg"></div><code class="block" lang="' + lang + '">'
        for(let t = i + 1 ; t < datas.length ; t++){
          let tt = datas[t];
          let ttt = tt.trim();
          if(ttt.length == 3 && ttt == '\`\`\`'){
            lastindex = t++;
            codediv = codediv + '</code></div>';
            break;
          }
          else{
            codediv = codediv + tt + '\n';
          }
        }
        if(lastindex != -1){
          i = lastindex;
          output = output + codediv;
          continue;
        }
      }

      //遍歷
      if(data_trim.length > 0){
        switch (data_trim[0]){
          case '#': //標題
            outputtemp = md.title(data);
            break;
          case '>': //引用
            break;
          case '-': //分割綫, 或者列表
            //let t = data.trim();
            if(data_trim.length > 2){ //文本長度大於 2
              let num = 0;
              for(let tt of data_trim){
                if(tt == '-'){
                  num++;
                }
                else if(num == 1 && tt == ' '){ //第二個字符為空格説明是列表
                  num = -1;
                  break;
                }
                //else if(num > 2){ //假如前邊不是 "-" 并且計數大於 2, 那麽説明該段字符末尾出現了除了 "-" 的壞東西 
                else{
                  num = 0;
                  break;
                }
              }
              if(num == -1){ //list
                if(output.length > 4 && output[output.length - 5] == '<' && output[output.length - 4] == '/' && (output[output.length - 3] == 'u' || output[output.length - 3] == 'o') &&
                output[output.length - 2] == 'l' && output[output.length - 1] == '>'){ //先看看前邊有沒有現成的列表 (我服了, 這些的是什麽鬼)
                  output = output.substring(0,output.length - 5);
                  outputtemp = md.list(data,0,1);
                }
                else{
                  outputtemp = md.list(data,1,1);
                }
              }
              else if(num > 2){ //line
                outputtemp = md.line();
              }
              else{ //p段落
                outputtemp = md.paragraph(data);
              }
            }
            else{
              outputtemp = md.paragraph(data);
            }
            break;
          default: //普通文本
            outputtemp = md.paragraph(data);
            break;
        }
      }
      
      //逐字解析
      let chartemp = []; //暫存字符
      let charindex = []; //該字符的所在位置
      for (let t = 0 ; t < outputtemp.length ; t++) {
        switch (outputtemp[t]){
          case '*': //要麽加粗, 要麽傾斜, 小孩才會做選擇, 俺全都要
            if(chartemp.length > 0 && chartemp[chartemp.length - 1].length < 3 && charindex[charindex.length - 1] == t - chartemp[chartemp.length - 1].length){
              chartemp[chartemp.length - 1] = chartemp[chartemp.length - 1] + '*';
            }
            else{
              chartemp.push(outputtemp[t]);
              charindex.push(t);
            }
            break;
          case '~': //剔除綫
            if(chartemp.length > 0 && chartemp[chartemp.length - 1].length < 2 && charindex[charindex.length - 1] == t - chartemp[chartemp.length - 1].length){
              chartemp[chartemp.length - 1] = chartemp[chartemp.length - 1] + '~';
            }
            else{
              chartemp.push(outputtemp[t]);
              charindex.push(t);
            }
            break;
          case '$': //那個數學公式
            chartemp.push(outputtemp[t]);
            charindex.push(t);
            break;
          case '\`': //那個内嵌代碼塊
            if(chartemp.length > 0 && chartemp[chartemp.length - 1].length < 2 && charindex[charindex.length - 1] == t - chartemp[chartemp.length - 1].length){
              chartemp[chartemp.length - 1] = chartemp[chartemp.length - 1] + '\`';
            }
            else{
              chartemp.push(outputtemp[t]);
              charindex.push(t);
            }
            break;
        }
      }
      // if(chartemp.length != 0){
      //   debugger;
      // }
      
      //逐字解析後篩選  *1 *2 *3 ~~ $$ ``
      let chartemp2 = [-1,-1,-1,-1,-1,-1]; //存儲在 chartemp 的索引, 出現一次填上索引, 再出現就移除, 理論上說, 假如關鍵符不是成對出現的, 那麽這裏必有索引
      function chartemp2_switch(index, value){ //懶, 直接封裝
        if(chartemp2[index] == -1){
          chartemp2[index] = value;
        }
        else{
          chartemp2[index] = -1;
        }
      }
      for(let t = 0 ; t < chartemp.length ; t++){
        switch (chartemp[t]){
          case '*':
            chartemp2_switch(0,t);
            break;
          case '**':
            chartemp2_switch(1,t);
            break;
          case '***':
            chartemp2_switch(2,t);
            break;
          case '~~':
            chartemp2_switch(3,t);
            break;
          case '$':
            chartemp2_switch(4,t);
            break;
          case '\`\`':
            chartemp2_switch(5,t);
            break;
        }
      }
      //篩選後移除
      for(let t = chartemp2.length - 1; t > -1 ; t--){
        if(chartemp2[t] != -1){
          chartemp.splice(chartemp2[t],1);
          charindex.splice(chartemp2[t],1);
        }
      }
      //現在開始插入
      chartemp2 = [0,0,0,0,0,0];
      function chartemp_ins(index, chartemp2_index, value, offset = 0){ //封裝太好用啦! 在 outputtemp 上的插入位置; chartemp2 寄存器索引; 插入的片段; 向後剔除多少字符
        value = value.split(',');
        if(chartemp2[chartemp2_index] == 0){
          chartemp2[chartemp2_index] = 1;
          value = value[1];
        }
        else{
          chartemp2[chartemp2_index] = 1;
          value = value[0];
        }
        outputtemp = outputtemp.substring(0,index) + value + outputtemp.substring(index + offset);
      }
      for(let t = chartemp.length - 1; t > -1 ; t--){
        switch (chartemp[t]){
          case '*': //傾斜
            chartemp_ins(charindex[t],0,'<i>,</i>',1);
            break;
          case '**': //加粗
            chartemp_ins(charindex[t],1,'<b>,</b>',2);
            break;
          case '***': //加粗 + 傾斜
            chartemp_ins(charindex[t],2,'<b><i>,</i></b>',3);
            // chartemp_ins(charindex[t],2,'<b>');
            break;
          case '~~': //剔除綫
            chartemp_ins(charindex[t],3,'<del>,</del>',2);
            break;
          case '$': //反正就是給數學公示用的
            chartemp_ins(charindex[t],4,'<span class="math">,</span>',1);
            break;
          case '\`\`': //代碼塊
            chartemp_ins(charindex[t],5,'<code>,</code>',2);
            break;
        }
      }

      //遍歷查找圖像 & 超鏈接
      function imgorlink(toimg = true) {
        let key;
        if(toimg == true){ //圖像與超鏈接的區別是, 圖像起始符是 '![', 而超鏈接起始符是 '['.
          key = '![';
        }
        else{
          key = '[';
        }
        
        let chartemp = [];
        let charindex = [];
        for (let t = 0 ; t < outputtemp.length ; t++){
          switch (outputtemp[t]){
            case '!':
              if(t + 1 < outputtemp.length && outputtemp[t + 1] == '[' && toimg == true){
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
              if(t + 1 < outputtemp.length && outputtemp[t + 1] == '('){
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
          let urltitle = outputtemp.substring(charindex[t - 1] + 2, charindex[t]).trim().split(' "');
          let url = urltitle[0];
          if(url.length == 0 || url == '"'){ //圖像失蹤了
            url = md.img404;
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
          let alt = outputtemp.substring(charindex[t - 2] + key.length, charindex[t - 1]);
          if(alt.length == 0){ //alt失蹤了怎麽辦呐!
            if(toimg == true){ //適用於圖像的解決方案 IMG
              if(url == md.img404 || url == '""'){
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
              if(url != md.img404){
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
            if(url == md.img404){
              // url = document.location.href;
              url = "/Web/404.html";
            }
            html = '<a href=' + url + title + ' target="blank_">' + alt + '</a>';
          }
          outputtemp = outputtemp.substring(0,charindex[t - 2]) + html + outputtemp.substring(charindex[t] + 1); //合并
          t = t - 2;
        }
      }

      //處理圖像和超鏈接
      imgorlink(true);
      imgorlink(false);
      
      //整合
      output = output + outputtemp;
    }

    //輸出 HTML
    return output;
  }
  
  //標題
  static title(data){
    let num = 0;
    let text = '';
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
    return '<div class="title"><a class="title">🔗</a><h' + num + ">" + text.trim()+ '</h' + num + '></div>';
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
    if(top == true){
      html = ulorol[0] + '<li>';
    }
    // html = html + data.trim().substring(2) + '</li>';
    data = data.trim().split(' ');
    data.splice(0,1);
    html = html + data.join(' ') + '</li>';
    if(bottom == true){
      html = html + ulorol[1];
    }
    return html;
  }

}
