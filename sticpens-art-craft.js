'use strict';
var request = require('co-request');
var cheerio = require('cheerio');
var co = require('co');
var fs = require('fs');
var Excel = require('exceljs');
var async = require('async');
var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('STICPENS6');
var _ = require('lodash');
var page_no = 0;
var link = 0;
var link1 = 0;
var pages_processed = 0;
var sleep = require('sleep');
const BaseUrl = [
  "http://www.sticpens.com/wax-crayons.php",
  "http://www.sticpens.com/hexa-oil.php",
  "http://www.sticpens.com/poster-color.php",
  "http://www.sticpens.com/retractable-crayons.php",
  "http://www.sticpens.com/plastic-crayons.php",
  "http://www.sticpens.com/color-numbers-set.php",
  "http://www.sticpens.com/glitterstix-color.php",
  "http://www.sticpens.com/glitterstix-art.php"
];
const LastSectionUrl = "";
const val = [ 
  "Wax Crayons",
  "Hexa Oil Pastels",
  "Poster Colors",
  "Retractable Crayons",
  "Plastic Crayons",
  "Color by Numbers Set",
  "Glitter Colors",
  "Glitter Activity Set"
];
const MainUrl = "http://www.sticpens.com/";
var fileName = "STICPENS";

worksheet.columns = [
  {
    header: "SKU",
    key: "sku",
    width: 30
  },
  {
    header: "Images",
    key: "imageUrls",
    width: 30
  },
  {
    header: "Path",
    key: "path",
    width: 30
  },
  {
    header: "Description",
    key: "description",
    width: 30
  },
  {
    header: "Specification",
    key: "specification",
    width: 30
  }
];


var fetchProductInfo = async.queue(function(saveObject, callback) {
  // console.log(url1);
  co(function*() {
    // console.log("yes");

    pages_processed++;

    //console.log(saveObject);
    // Save to Excel

    worksheet.addRow(saveObject).commit();

    yield workbook.xlsx.writeFile("s1.xlsx").then(function() {
      console.log("Row added & Saved");
    });


    //Wait for some time before next call
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
}, 3);


var fetchProductUrls = async.queue(function(url, callback) {
  co(function*() {
    for (let i = 6; i <= 7; i++) {
      console.log(BaseUrl[i]);
      let result = yield request(BaseUrl[i]);
      let response = result;
      let body = result.body;
      var $ = cheerio.load(body, {
        xmlMode: true
      });
      //console.log(result);
      let description = "";
      $('ul.range li').each(function(j, li) {
        description += $(li).text().trim();
        description += "\n";
      });
      console.log(description);

      $('div.block').each(function(j, li) {
        var sku = $(li).find('div.model span').text().trim();
        console.log(sku);

        var imageUrls = MainUrl + $(li).find('img').attr('src');
        console.log(imageUrls);

        var details = $(li).find('a').attr('onmouseover');
        //console.log(details);

        let specification = "";//"Ink Colour: ";

        if (sku) {
          let start = details.indexOf(">", 0), end;
          let cnt = 0;

          while (start != -1) {
            end = details.indexOf("<", start);
            if (end == -1) {
              break;
            }
            //console.log(start, end);
            specification += details.substring(start+1, end);
            if (end - start > 2) {
              cnt++;
              if (cnt % 2 == 0) {
                specification += ", ";
              }
            }
            start = details.indexOf(">", end);
          }
        }
        console.log(specification);

        let path = "Home | Art & Craft Material | " + val[i];
        console.log(path);

        var saveObject = {
          sku: sku,
          imageUrls: imageUrls,
          path: path,
          description: description,
          specification: specification
        };
        //console.log(saveObject);
        fetchProductInfo.push(saveObject, function(err) {
          link1++;
          console.log('Product - ' + link1 + ' finished processing - Links Left - ' + fetchProductInfo.length() + "\n");
        });
      });
    }
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
}, 2);

fetchProductInfo.drain = function() {
  console.log('All products processed');
  process.exit(1);
};

var init = function() {
  co(function*() {
    fetchProductUrls.push(0, function(err) {
      link++;
      console.log('Link - ' + link + ' finished processing - Links Left - ' + fetchProductUrls.length());
    });
  }).then(function(value) {});
  console.log("After fetch urls");
};

console.log("started scraping STICPENS!!!")
init();