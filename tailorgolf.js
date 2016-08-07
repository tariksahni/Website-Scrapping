'use strict';
var request = require('co-request');
var cheerio = require('cheerio');
var co = require('co');
var Excel = require('exceljs');
var async = require('async');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('TAILORMADEGOLF');
var _ = require('lodash');
var page_no = 0;
var link = 0;
var link1 = 0;
var pages_processed = 0;
var sleep = require('sleep');
const BaseUrl = "http://taylormadegolfindia.com/product-category/accessories/page/";

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
    width: 15
  },
  {
    header: "Description",
    key: "description",
    width: 30
  },
  {
    header: "Category",
    key: "category",
    width: 15
  },
  {
    header: "SKU",
    key: "sku",
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
    console.log(url1);
    let result = yield request(url1);
    let response = result;
    let body = result.body;
    var $ = cheerio.load(body, {
      xmlMode: true
    });
    var title = $('h1.product_title').text().trim();
    
    var price = $('meta[itemprop="price"]').attr('content');
    var url = url1.replace(/(\r\n|\n|\r)/gm, "");
    var imageUrls = $('div.product_images img').attr('src');

    var description = $('div.resp-tabs-container').find('div').first().find('p').text();
    var type = $('div.product_description p').text().trim();
    var sku = $('span.sku').text().trim();
    var category = $('span.posted_in a').text().trim();
    var keywords = 'NA';
    var brand = "TailorMade";
    var path; 
    var i =0;
    $('nav.woocommerce-breadcrumb').find('a').each(function(i,ll){
      if( i == 0){
        path = $(this).text().trim();
        path += ' | ';
      }
      else{
        path += $(this).text().trim();
        path += ' | '
      }

    });
    path += title ;
    var saveObject = {
      url: url,
      title: title,
      imageUrls: imageUrls,
      price:price,
      category:category,
      type:type,
      brand:brand,
      sku:sku,
      description: description,
      path: path,
      keywords: keywords
    };
    //console.log(saveObject);
    worksheet.addRow(saveObject).commit();
    yield workbook.xlsx.writeFile("Tailormade(accessories).xlsx").then(function() {
      console.log("Row added & Saved");
    });
    var stop = new Date().getTime();
    while (true) {
      if (new Date().getTime() > stop + 2500) {
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
    // console.log(url);
    let result = yield request(url);
    let response = result;
    let body = result.body;
    var $ = cheerio.load(body, {
      xmlMode: true
    });
    $('div.large-12 div.product_images_wrapper').each(function(i, li) {
      // console.log(i);
      $(li).find('div.product_images_hover').find('a.read_more_product').each(function(j, divEl) {
        let url22 = $(divEl).attr('href');
        // console.log(url22);
        fetchProductInfo.push(url22, function(err) {
          link1++;
          console.log('Product - ' + link1 + ' finished processing - Links Left - ' + fetchProductInfo.length() + "\n");
        });
        
      });  
    });
    var stop = new Date().getTime();
    while (true) {
      if (new Date().getTime() > stop + 2500) {
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
  for (var i = 1; i <= 4; i++) {
    co(function*() {
      fetchProductUrls.push(BaseUrl+ i +'/', function(err) {
        link++;
        console.log('Link - ' + link + ' finished processing - Links Left - ' + fetchProductUrls.length());
      });
    }).then(function(value) {});
  }
  console.log("After fetch urls");
};

console.log("started scraping TAILORMADEGOLF!!!")
init();