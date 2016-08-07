'use strict';
var request = require('co-request');
var cheerio = require('cheerio');
var co = require('co');
var Excel = require('exceljs');
var async = require('async');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('ASICS');
var _ = require('lodash');
var page_no = 0;
var link = 0;
var link1 = 0;
var link11 =0;
var pages_processed = 0;
var sleep = require('sleep');
const BaseUrl = "http://uniball.in/shop/index.php?id_lang=1&id_category=12&controller=category&n=56";
const MainUrl = "";
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
    header: "Price",
    key: "price",
    width: 30
  },
  {
    header: "Ink Colour",
    key: "ic",
    width: 15
  },
  {
    header: "Brand",
    key: "brand",
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
var fetchProductInfo1 = async.queue(function(obj,callback) {
  co(function*(){
    var url1 = obj.url ;
    console.log(url1);
    let result = yield request(url1);
    let response = result;
    let body = result.body;
    var $ = cheerio.load(body, {
      xmlMode: true
    });
    var title = $('div#pb-left-column h1').text().trim();
    title += " (";
    title += obj.colour ;
    title += ") ";
    var url = url1.replace(/(\r\n|\n|\r)/gm, "");
    var imageUrls = $('div#image-block span#view_full_size').find('img').first().attr('src');
    var brand = "Uniball";
    var price = $('span#our_price_display').text().trim();
    var description = $('div#short_description_content').find('span').text().trim();
    var path = "View All Collections|";
    path += title ;
    var keywords = "NA";
    var ic =  obj.colour;
    var saveObject = {
      url: url,
      title: title,
      imageUrls: imageUrls,
      brand:brand,
      description:description,
      price:price,
      ic:ic,
      path: path,
      keywords:keywords 
    };
    console.log(imageUrls);
    // worksheet.addRow(saveObject).commit();
    // yield workbook.xlsx.writeFile("uniball(1).xlsx").then(function() {
    //   console.log("Row added & Saved");
    // });
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

var fetchProductInfo = async.queue(function(url1, callback) {
  co(function*(){
    // console.log(url1);
    let result = yield request(url1);
    let response = result;
    let body = result.body;
    var $ = cheerio.load(body, {
      xmlMode: true
    });
    // console.log(body);
    var ic1 = [];
    $('div.attribute_list option').each(function(i,optiosn){
      ic1[i] = $(this).attr('title');
    });
    // console.log(ic1);
    var Last ;
    var url2222 ;
    for (var j=0 ; j<ic1.length;j++){
      if(ic1[j] == 'Blue')Last= "#/ink_color-blue" ;
      if(ic1[j] == 'Red')Last= "#/ink_color-red" ;
      if(ic1[j] == 'Black')Last= "#/ink_color-black" ;
      if(ic1[j] == 'Green')Last= "#/ink_color-green" ;
      if(ic1[j] == 'Orange')Last= "#/ink_color-orange" ;
      if(ic1[j] == 'Voilet')Last= "#/ink_color-voilet" ;
      if(ic1[j] == 'Pink')Last= "#/ink_color-pink" ;
      if(ic1[j] == 'Gold')Last= "#/ink_color-gold" ;
      if(ic1[j] == 'Silver')Last= "#/ink_color-silver" ;
      if(ic1[j] == 'Grey')Last= "#/ink_color-grey" ;
      if(ic1[j] == 'Brown')Last= "#/ink_color-brown" ;
      if(ic1[j] == 'Smoke')Last= "#/ink_color-smoke" ;
      if(ic1[j] == 'Light Blue')Last= "#/ink_color-light_blue" ;
      if(ic1[j] == 'Light Green')Last= "#/ink_color-light_green" ;
      if(ic1[j] == 'Wine Red')Last= "#/ink_color-wine_red" ;
      if(ic1[j] == 'White')Last= "#/ink_color-white" ;
      if(ic1[j] == 'Fluorescent Yellow')Last= "#/ink_color-fluorescent_yellow" ;
      if(ic1[j] == 'Fluorescent Red')Last= "#/ink_color-fluorescent_red" ;
      if(ic1[j] == 'Fluorescent Orange')Last= "#/ink_color-fluorescent_orange" ;
      if(ic1[j] == 'Fluorescent Pink')Last= "#/ink_color-fluorescent_pink" ;
      url2222 = url1.concat(Last);
      // console.log(url2222);
      var obj ={};
      obj.url = url2222;
      obj.colour = ic1[j] ;
      // console.log(obj);
      fetchProductInfo1.push(obj, function(err) {
        link11++;
        console.log('Product - ' + link11 + ' finished processing - Links Left - ' + fetchProductInfo1.length() + "\n");
      });
    }
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
    // console.log("fecturl walle  mei")
    let result = yield request(url);
    let response = result;
    let body = result.body;
    var $ = cheerio.load(body, {
      xmlMode: true
    });
    $('ul#product_list li').each(function(i, li) {
      $(li).find('a.product_img_link').each(function(j, l) {
        var url221 = $(l).attr('href');
        console.log(url221);
        url221 = "http://uniball.in/shop/index.php?id_product=64&controller=product&id_lang=1";
        fetchProductInfo.push(url221, function(err) {
          link1++;
          console.log('Product - ' + link1 + ' finished processing - Links Left - ' + fetchProductInfo.length() + "\n");
        });
      });
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


fetchProductInfo.drain = function() {
  console.log('All products processed'.blue);
  process.exit(1);
};

var init = function() {
    console.log(BaseUrl);
    co(function*() {
      fetchProductUrls.push(BaseUrl, function(err) {
        link++;
        console.log('Link - ' + link + ' finished processing - Links Left - ' + fetchProductUrls.length());
      });
    }).then(function(value) {});
  
  console.log("After fetch urls");
};

console.log("started scraping UNIBALLL!!!")
init();