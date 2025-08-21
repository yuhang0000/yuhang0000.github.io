//創建一個類
class md{

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

      //遍歷
      if(data.trim().length > 0){
        switch (data.trim()[0]){
          case '#': //標題
            outputtemp = md.title(data);
            break;
          case '>': //引用
            break;
          case '-': //分割綫, 或者列表
            let num = 0;
            for (let t of data.trim()) {
              if (t == "-") {
                num++;
              }
              else {
                break;
              }
              if(num > 2){
                outputtemp = md.line();
              }
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
  
}
