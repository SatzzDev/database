import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import cliSpinners from 'cli-spinners';

const spinner = cliSpinners.dots;
let index = 0;
const category = 'popular';
const result = [{ creator: '@krniwnstria', mobile: [], desktop: [] }];
const baseUrl = `https://hdqwalls.com/${category}-wallpapers`;

if (!fs.existsSync('./wallpaper')) {
  fs.mkdirSync('./wallpaper');
}

const spinnerInterval = setInterval(() => {
  process.stdout.write(`\r${spinner.frames[index = ++index % spinner.frames.length]} Scraping...`);
}, spinner.interval);

(async () => {
  try {
    for (let i = 1; i <= 4600; i++) {
      const url = i === 1 ? baseUrl : `${baseUrl}/page/${i}`;
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      $('div.wallpapers_container div.column_padding').each((a, b) => {
        const img = $(b).find('img').attr('src');
        if (img) {
          result[0].desktop.push(img.replace('wallpapers/thumb/', 'download/').split(".jpg")[0] + `-5120x2880.jpg`);
          result[0].mobile.push(img.replace('wallpapers/thumb/', 'download/').split(".jpg")[0] + `-2160x3840.jpg`);
        }
      });

      console.log(`Page ${i} scraped.`);
    }

    clearInterval(spinnerInterval);
    console.log('\nScraping finished!');
    fs.writeFileSync(`./wallpaper/${category}.json`, JSON.stringify(result, null, 2), 'utf-8');
  } catch (err) {
    clearInterval(spinnerInterval);
    console.error('Error during scraping:', err.message || err);
  }
})();
