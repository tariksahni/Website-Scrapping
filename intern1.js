'use strict';
var request = require('co-request');
var cheerio = require('cheerio');
var co = require('co');
var Excel = require('exceljs');
var async = require('async');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('DATA');
var _ = require('lodash');
var page_no = 0;
var link = 0;
var link1 = 0;
var pages_processed = 0;
var sleep = require('sleep');
const BaseUrls = ["http://macawbooksonline.com/categoryview/Dictionary/book","http://macawbooksonline.com/categoryview/Coloring-and-Activity-Books/book","http://macawbooksonline.com/categoryview/Copy%20Color%20Shaped/book","http://macawbooksonline.com/categoryview/Environment%20Science%20Essentials/book","http://macawbooksonline.com/categoryview/Facts%20and%20More-Top%20Ten/book&%20pagesize%20=%209%20&%20cat%20=%20&min=0&max=0&binding=&pageid=0","http://macawbooksonline.com/categoryview/Facts%20and%20More-Top%20Ten/book&pagesize=9&cat=&min=0&max=0&binding=&pageid=1","http://macawbooksonline.com/categoryview/12/book&%20pagesize%20=%209%20&%20cat%20=%20&min=0&max=0&binding=&pageid=0","http://macawbooksonline.com/categoryview/12/book&pagesize=9&cat=&min=0&max=0&binding=&pageid=1","http://macawbooksonline.com/categoryview/Facts%20and%20More-Global%20Warming/book","http://macawbooksonline.com/categoryview/Facts%20and%20More-Global%20Warming/book&pagesize=9&cat=&min=0&max=0&binding=&pageid=1","http://macawbooksonline.com/categoryview/Go%20Green/book","http://macawbooksonline.com/categoryview/Science%20Graphic%20Stories/book","http://macawbooksonline.com/categoryview/Why%20Series/book","http://macawbooksonline.com/categoryview/Why%20Series./book","http://macawbooksonline.com/categoryview/Animals%20Tales%20with%20CD/book","http://macawbooksonline.com/categoryview/Animated%20CD%20Classics/book","http://macawbooksonline.com/categoryview/Arabian-Nights/book","http://macawbooksonline.com/categoryview/Graded%20English%20Readers/book","http://macawbooksonline.com/categoryview/Graded%20English%20Readers/book&pagesize=9&cat=&min=0&max=0&binding=&pageid=1","http://macawbooksonline.com/categoryview/Graded%20English%20Readers/book&pagesize=9&cat=&min=0&max=0&binding=&pageid=2","http://macawbooksonline.com/categoryview/Graded%20English%20Readers/book&pagesize=9&cat=&min=0&max=0&binding=&pageid=3","http://macawbooksonline.com/categoryview/Keywords/book","http://macawbooksonline.com/categoryview/Phonics/book","http://macawbooksonline.com/categoryview/Phonics%20Workbook/book","http://macawbooksonline.com/categoryview/Pre%20Nursery%20Book%20with%20stickers/book","http://macawbooksonline.com/categoryview/Pre%20Nursery%20Book%20with%20stickers/book&pagesize=9&cat=&min=0&max=0&binding=&pageid=1","http://macawbooksonline.com/categoryview/Read%20and%20Learn%20Grammar/book","http://macawbooksonline.com/categoryview/A%20day%20with-Great%20Personalities/book","http://macawbooksonline.com/categoryview/A%20day%20with-Great%20Personalities/book&pagesize=9&cat=&min=0&max=0&binding=&pageid=1","http://macawbooksonline.com/categoryview/A%20day%20with-Scientists/book","http://macawbooksonline.com/categoryview/Great%20Muslim%20Scholars/book","http://macawbooksonline.com/categoryview/Great%20Muslim%20Scholars/book&pagesize=9&cat=&min=0&max=0&binding=&pageid=1","http://macawbooksonline.com/categoryview/Great%20Saints%20of%20India/book","http://macawbooksonline.com/categoryview/Indian%20Myths%20and%20Legends/book","http://macawbooksonline.com/categoryview/Indian%20Myths%20and%20Legends/book&pagesize=9&cat=&min=0&max=0&binding=&pageid=1","http://macawbooksonline.com/categoryview/Indian%20Myths%20and%20Legends/book&pagesize=9&cat=&min=0&max=0&binding=&pageid=2","http://macawbooksonline.com/categoryview/Tales%20from%20Indian%20Mythology/book","http://macawbooksonline.com/categoryview/Gift%20Sets/book","http://macawbooksonline.com/categoryview/Gift%20Sets/book&pagesize=9&cat=&min=0&max=0&binding=&pageid=1","http://macawbooksonline.com/categoryview/Gift%20Sets/book&pagesize=9&cat=&min=0&max=0&binding=&pageid=2","http://macawbooksonline.com/categoryview/Gift%20Sets/book&pagesize=9&cat=&min=0&max=0&binding=&pageid=3","http://macawbooksonline.com/categoryview/Cursive%20Writing../book","http://macawbooksonline.com/categoryview/Logical%20Reasoning/book","http://macawbooksonline.com/categoryview/Mental%20Mathematics/book","http://macawbooksonline.com/categoryview/Quantitative%20Reasoning%20Practice/book","http://macawbooksonline.com/categoryview/Verbal%20Reasoning/book","http://macawbooksonline.com/categoryview/Abridged%20Classics/book","http://macawbooksonline.com/categoryview/Aesop%20Fables/book","http://macawbooksonline.com/categoryview/Aesop%20Fables/book&pagesize=9&cat=&min=0&max=0&binding=&pageid=1","http://macawbooksonline.com/categoryview/Anderson's%20Fairy%20Tales/book","http://macawbooksonline.com/categoryview/Bible%20Stories/book","http://macawbooksonline.com/categoryview/Clay%20Tales/book","http://macawbooksonline.com/categoryview/Grimm's%20Fairy%20Tales/book","http://macawbooksonline.com/categoryview/Jataka%20Tales/book","http://macawbooksonline.com/categoryview/Jataka%20Tales/book&pagesize=9&cat=&min=0&max=0&binding=&pageid=1","http://macawbooksonline.com/categoryview/Macaw%20Young%20Classics/book","http://macawbooksonline.com/categoryview/Moral%20stories/book","http://macawbooksonline.com/categoryview/What%20U%20see%20is%20not%20Always/book","http://macawbooksonline.com/categoryview/Young%20Classics/book","http://macawbooksonline.com/categoryview/Animals%20Tales/book","http://macawbooksonline.com/categoryview/Creative%20Art/book","http://macawbooksonline.com/categoryview/Discover%20More/book","http://macawbooksonline.com/categoryview/Emotional%20Quotient%20Stories/book","http://macawbooksonline.com/categoryview/Hey%20Mom./book","http://macawbooksonline.com/categoryview/Info%20Tales/book","http://macawbooksonline.com/categoryview/Magic%20Illusion/book","http://macawbooksonline.com/categoryview/Stories%20With%202%20Ends/book","http://macawbooksonline.com/categoryview/The%20Midnight%20Witch%20Flap%20Book/book","http://macawbooksonline.com/categoryview/Two%20Poles%20Stories/book"];
const MainUrl = "http://macawbooksonline.com/";
worksheet.columns = [
  {
    header: "URL",
    key: "url",
    width: 30
  },
  {
    header: "Title",
    key: "title",
    width: 20
  },
  {
    header: "Images",
    key: "imageUrls",
    width: 30
  },
  {
    header: "MRP",
    key: "mrp",
    width: 30
  },
  {
    header: "Actual Price",
    key: "price",
    width: 30
  },
  {
    header: "Author",
    key: "author",
    width: 15
  },
  {
    header: "ISBN",
    key: "isbn",
    width: 15
  },
  {
    header: "Number of Pages",
    key: "nop",
    width: 15
  },
  {
    header: "VOLUME",
    key: "vol",
    width: 15
  },
  {
    header: "TYPE",
    key: "type",
    width: 15
  },
  {
    header: "Description",
    key: "description",
    width: 15
  },
  {
    header: "Path",
    key: "path",
    width: 30
  },
  {
    header: "Keywords",
    key: "keywords",
    width: 30
  }
];

var fetchProductInfo = async.queue(function(url1, callback) {
  co(function*(){
    let result = yield request(url1);
    let response = result;
    let body = result.body;
    var $ = cheerio.load(body, {
      xmlMode: true
    });
    var url = url1;
    var title=  $('td h1').first().text().trim();
    var temp_image = $('div.preview_box a').attr('href').split('&')[0];
    var imageUrls = MainUrl.concat(temp_image);
    var path1 = "";
    $('span.bradcrumb').each(function(i,span){
      path1 += $(span).text().trim();
      path1 += '|'
    });
    var path = path1.replace(/&nbsp;/g, '');
    var mrp = $('td.black_strickout').text();
    var price = $('td.big_price').text();
    var black_walla = [] ;
    $('td.black_bold').each(function(i,black){
      black_walla[i] = $(black).text().trim();
    });
    var length_black = black_walla.length ;
    var gray_walla = [] ;
    $('td.gray_bold').each(function(i,gray){
      gray_walla[i] = $(gray).text().trim();
    });
    var length_gray = gray_walla.length ;
    var value_black = [];
    for ( var i = 0 ; i < ( length_gray - 4 ) ; i = i+2 ){
      value_black.push(gray_walla[i]);
    } 
    for( var i =0; i <= length_black ; i ++ ){
      if(value_black[i] == 'Author'){
        var author = black_walla[i];
      }
      if(value_black[i] == 'ISBN'){
        var isbn = black_walla[i];
      }
      if(value_black[i] == 'Pages'){
        var nop = black_walla[i];
      }
      if(value_black[i] == 'Volume'){
        var vol = black_walla[i];
      }
      if(value_black[i] == 'Type'){
        var type = black_walla[i];
      }
    }
    var description1 = $('td.text').text().trim().replace(/(\r\n|\n|\r)/gm, "");
    var description = description1.replace(/&nbsp;/g, '');
    var keywords = $('meta[name="keywords"]').attr('content').replace(/(\r\n|\n|\r)/gm, "");
    var saveObject = {
      url: url,
      title: title,
      imageUrls: imageUrls,
      mrp:mrp,
      price:price,
      author: author,
      nop: nop,
      isbn: isbn,
      vol:vol,
      type:type,
      description:description,
      path: path,
      keywords:keywords 
    };
    // console.log(saveObject);
    worksheet.addRow(saveObject).commit();
    yield workbook.xlsx.writeFile("macawbooks.xlsx").then(function() {
      console.log("Row added & Saved");
    });
    var stop = new Date().getTime();
    while (true) {
      if (new Date().getTime() > stop + 2000) {
        callback();
        break;
      }
    }
  }).catch(function(err) {
    console.error(err);
    callback();
  });
}, 1);

var fetchProductUrls = async.queue(function(url, callback) {
  co(function*() {
    let result = yield request(url);
    let response = result;
    let body = result.body;
    var $ = cheerio.load(body, {
      xmlMode: true
    });
    $('td.categories_products').find('a').each(function(i, a) {
      var url_temp = $(a).attr('href');
      var url1 = MainUrl.concat(url_temp);
      // url1 = "http://macawbooksonline.com/productdetails/My%20First%20365%20Words/0&comefrom=1342";
      fetchProductInfo.push(url1, function(err) {
        link1++;
        console.log('Product - ' + link1 + ' finished processing - Links Left - ' + fetchProductInfo.length() + "\n");
      });  
    });
    var stop = new Date().getTime();
    while (true) {
      if (new Date().getTime() > stop + 3500) {
        callback();
        break;
      }
    }
  }).catch(function(err) {
    console.error(err);
    callback();
  });
}, 1);

fetchProductInfo.drain = function() {
  console.log('All products processed'.blue);
  process.exit(1);
};

var init = function() {
  for(var i =0 ; i < BaseUrls.length ; i++){
    co(function*() {
      fetchProductUrls.push(BaseUrls[i], function(err) {
        link++;
        console.log('Link - ' + link + ' finished processing - Links Left - ' + fetchProductUrls.length());
      });
    }).then(function(value) {});
  }
  
  console.log("After fetch urls");
};

console.log("started scraping !!!")
init();