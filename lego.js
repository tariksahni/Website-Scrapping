'use strict';
var request = require('co-request');
var cheerio = require('cheerio');
var co = require('co');
var fs = require('fs');
var Excel = require('exceljs');
var async = require('async');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('LEGO');
var _ = require('lodash');
var page_no = 0;
var link = 0;
var link1 = 0;
var pages =0;
var pages_processed = 0;
var sleep = require('sleep');
const MainUrl = "http://shop.lego.com";
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
    header: "Description",
    key: "description",
    width: 30
  },
  {
    header: "Price",
    key: "price",
    width: 15
  },
  {
    header: "Item Number",
    key: "item",
    width: 15
  },
  {
    header: "Brand",
    key: "brand",
    width: 15
  },
  {
    header: "Type",
    key: "type",
    width: 15
  },
  {
    header: "SKU",
    key: "sku",
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

var checkIfProductPage = async.queue(function(url1, callback) {
  co(function*(){
    try {
    // console.log(url1);
    let result = yield request(url1);
    let response = result;
    let body = result.body;
    var $ = cheerio.load(body, {
      xmlMode: true
    });
    // console.log($('h1#product-title'));
    var title = $('h1#product-title').find('span.test-microdata-name').text().trim();
    var url = url1.replace(/(\r\n|\n|\r)/gm, "");
    var item = $('div#product-details').find('ul#product-info li.test-item').find('em').text().trim();
    var urlset1 = 'http://cache.lego.com/e/dynamic/is/image/LEGO/';
    var urlset2= '_is?req=imageset';
    var urlset = urlset1 + item + urlset2;
    // console.log(urlset);
    let postOptions = {
          url: urlset,
          method: 'GET'
    };
    let resultImages = yield request(postOptions);
    var imagesBody = resultImages.body;
    var imagesArray = imagesBody.split('_');
    var imageUrls ;
    if(imagesArray.length == 1){
      imageUrls = $('div.test-microdata-schema img').attr('src');
    }
    if(imagesArray.length > 1){
      var totalNumberOfImages = imagesArray[imagesArray.length - 1].split('t')[1];
      imageUrls = 'http://cache.lego.com/e/dynamic/is/image/LEGO/'+item +'_alt1?$main$';
      imageUrls +=' ; '
      imageUrls += $('div.test-microdata-schema img').attr('src');
      imageUrls +=' ; '
      for(var k = 2 ; k <=totalNumberOfImages; k++ ){
        imageUrls+= 'http://cache.lego.com/e/dynamic/is/image/LEGO/';
        imageUrls+=item;
        imageUrls+= '_alt';
        imageUrls+=k;
        imageUrls+='?$main$';
        imageUrls+=' ; ';
      }
    }
    // console.log(imageUrls);
    var price = $('span.product-price em').text().trim();
    // var item = $('div#product-details').find('ul#product-info li.test-item').find('em').text().trim();
    var description = $('p.test-marketingText').text().trim();
    if(description){
      description = description.replace(/(\r\n|\n|\r)/gm, "");
    } 
    var sku =$('form#add-product').find('input[name="/atg/commerce/order/purchase/CartModifierFormHandler.catalogRefIds"]').attr('value').split('u')[1];
    var brand = "Lego";
    var type;
    var path = "LEGO Shop Home | "
    $('span#crumb_').each(function(i,oo){
      if(i == 1){
        type = $(this).text().trim();
      }
      path +=$(this).text().trim();
      path += ' | ' ;
    });
    path += $('span.currentNode').text().trim();
    var keywords = $('meta[name="KeyWords"]').attr('content');
    if(keywords){
      keywords = keywords.replace(/(\r\n|\n|\r)/gm, "");
    }  
    // console.log(title);
    var saveObject = {
      url: url,
      title: title,
      imageUrls: imageUrls,
      brand:brand,
      item:item,
      sku:sku,
      type:type,
      price:price,
      description: description,
      path: path,
      keywords: keywords
    };
    console.log(saveObject);
    worksheet.addRow(saveObject).commit();
    yield workbook.xlsx.writeFile("Lego.xlsx").then(function() {
      console.log("Row added & Saved");
    });
    var stop = new Date().getTime();
    while (true) {
      if (new Date().getTime() > stop + 2000) {
        callback();
        break;
      }
    }
    } catch(err) {
      console.log(err);
      callback();
    }
  }).catch(function(err) {
    //console.error(err);
    callback();
  });
}, 1);


var fetchProductUrls = function() {
  co(function*() {
    console.log("haan");
    var input = fs.readFileSync('/home/tarik/Desktop/scraping projects/scraper/lego_base.html');
    var  $ = cheerio.load(input);
    $('ul#product-results').find('li').each(function(i,li){
      $(li).find('h4 a').each(function(j,aElem){
        var url11 = $(aElem).attr('href');
        var url22 = MainUrl.concat(url11);
        // url22 = "http://shop.lego.com/en-US/Trumpsy-41562?fromListing=listing";
        // console.log(url22);
        co(function*() {
          checkIfProductPage.push(url22, function(err) {
            pages++;
            console.log('Page - ' + pages + ' finished processing - Pages Left - ' +
            checkIfProductPage.length() + '\n');
          });
        }).then(function(value) {
           //console.log(value);
        }).catch(function(err) {
           //console.log(err)
        });
      });
    });
  }).then(function(value) {
    //console.log(value);
  }).catch(function(err) {
    //console.error(err.stack);
  });
}

checkIfProductPage.drain = function() {
  console.log('All pages processed');
  process.exit(1);
};

var init = function() {
  fetchProductUrls();  
  console.log("After fetch urls");
};

console.log("started scraping LEGO!!!")
init();