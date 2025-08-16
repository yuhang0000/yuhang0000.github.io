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
    for(let i = 0; i < datas.length ; i++){
      let data = datas[i];
      console.log(data);
      
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
              meta['tag'] = value;
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
          console.table(meta);
          continue;
        }
      }
      
    }
  }
  
  //標題
  static title(data){
    
  }
  
}
