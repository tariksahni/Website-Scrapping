'use strict';
var request = require('request-promise');
var cheerio = require('cheerio');
var co = require('co');
var async = require('async');
var sleep = require('sleep');
var _ = require('lodash');
var Excel = require('exceljs');
var pages = 0;
var productPages = 0;

var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('HP Ink And Toner');
var baseUrl = 'http://www.hpshopping.in/ProductListing.asmx/GetProductList';
// 'http://www.hpshopping.in/Ink_and_Toner/Ink_Cartridges';
var mainUrl = 'http://www.hpshopping.in/';

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
    header: "MRP",
    key: "price",
    width: 15
  },
  
  {
    header: "Images",
    key: "imageUrls",
    width: 30
  },
  
  {
    header: "Brand",
    key: "Actors",
    width: 30
  },

  {
    header: "Model Number",
    key: "Directors",
    width: 30
  },
  {
    header: "Path",
    key: "path",
    width: 15
  },
  {
    header: "KeyWords",
    key: "keywords",
    width: 15
  },
  {
    header: "Description",
    key: "description",
    width: 15
  }
  ];

var checkIfProductPage = async.queue(function(url1, callback) {
  co(function*() {
    let result = yield request(url1);
    let response = result;
    var $ = cheerio.load(result);
    var url = url1;

    var price = $('label#lblprice').text();
    var imageUrls1 = $('div.prdt_lft').find('img').first().attr('src');
    var imageUrls = mainUrl.concat(imageUrls1);
    var Actors = "HP";
    var Directors1 = $('div.prdt_details_top h4').text();
    var Directors2 = Directors1.split(':');

    var Directors3 = Directors2[1];

    //var Directors = Directors3.splice(lenn-1,1);
    var Directors4 = Directors3.trim();
    var Directors5 = Directors4.split(')');
    var Directors =Directors5[0];
    console.log(Directors);
    var title = $('div.prdt_details_top h3').text().trim();

    var path = "";
    $('div.breadcrumbs li').each(function(i, li) {
      if (!$(li).hasClass('breadcrumbs')) {
        path += $(li).text().trim() + " | ";
      }
    });

    var keywords = $('meta[name=KeyWords]').attr('content');
    var description = title;
    
      //console.log(Directors);

    var saveObject = {
      url: url1,
      title: title,
      
      imageUrls: imageUrls,
      price: price,
      description: description,
      Actors: Actors,
      Directors: Directors,
      path: path,
      keywords: keywords
    };

    // if ($('div').hasClass('body-c1')) {
    worksheet.addRow(saveObject).commit();;

    yield workbook.xlsx.writeFile('HP_INK_CARTRIDGES.xlsx').then(function() {
      console.log('Row added & Saved');
    });

    //Wait for some time before next call
    var stop = new Date().getTime();
    while (true) {
      if (new Date().getTime() > stop + 2000) {
        callback();
        break;
      }
    }
  // } else {
  //   console.log(url1 + ' - Not Product');
  //   callback();
  // }
  }).catch(function(err) {
    console.error(err);
    callback();
  });
}, 1);

function fetchSiteUrls() {
  co(function*() {
    console.log('Inside fetchSiteUrls');
    try {
      for (let i = 1; i < 21; i++) {
      //for (let i = 1; i < 2; i++) {
        let postOptions = {
          uri: baseUrl,
          method: 'POST',
          body: {
            vRefTypeName: 'Ink_and_Toner',
            vCurrentPage: i.toString(),
            vTabbedPanel: '4',
            vFilterValues: 'Ink_Cartridges',
            vSearch: '',
            vStoreName: 'STORE',
            vItemTotal: '168'
          },
          headers: {
            'Content-Type': 'application/json'
          },
          json: true
        };

        let result = yield request(postOptions);
        let body = result.d[0].ProductList;

        var $ = cheerio.load(body, {
          xmlMode: true
        });

        $('div.img').each(function(index, divElem) {
          let link = $(divElem).find('a').attr('href');
          // link = "http://www.hpshopping.in/HP_18_Magenta_Original_Ink_Cartridge";
          console.log(link);
          co(function*() {
            checkIfProductPage.push(link, function(err) {
              pages++;
              console.log('Page - ' + pages + ' finished processing - Pages Left - ' +
                checkIfProductPage.length() + '\n');
            });
          }).then(function(value) {
            console.log(value);
          }).catch(function(err) {
            console.log(err)
          });
        });
      }
    } catch (err) {
      console.log(err);
    }
  }).then(function(value) {
    console.log(value);
  }).catch(function(err) {
    console.error(err.stack);
  });
}

checkIfProductPage.drain = function() {
  console.log('All pages processed');
  process.exit(1);
};

var init = function() {
  fetchSiteUrls();
  console.log('After fetch urls');
};

console.log('Starting HP Crawling....');
init();
