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
