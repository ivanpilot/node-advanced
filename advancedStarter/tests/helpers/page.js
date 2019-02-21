const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: true, 
            args: ['--no-sandbox']
        });
       
        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function(target, property) {
                return customPage[property] || browser[property] || page[property]
            }
        })
    }

    constructor(page) {
        this.page = page;
    }

    async login() {
        const user = await userFactory();
        const { session, sig } = sessionFactory(user);

        await this.page.setCookie({ name: 'session', value: session })
        await this.page.setCookie({ name: 'session.sig', value: sig })
        await this.page.goto('http://localhost:3000/blogs')
        // the reason we go to the same page is because once the cookie is set we need to mechanically send a new request to the server to visit the page like it is the case in reality with oauth

        await this.page.waitFor('a[href="/auth/logout"]');
    }

    async getContentsOf(selector) {
        return await this.page.$eval(selector, el => el.innerHTML);
    }
}

module.exports = CustomPage;