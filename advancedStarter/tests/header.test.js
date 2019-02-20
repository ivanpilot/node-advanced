//const puppeteer = require('puppeteer');
//const sessionFactory = require('./factories/sessionFactory');
//const userFactory = require('./factories/userFactory');
const Page = require('./helpers/page')

//let browser;
let page;

beforeEach(async () => {
//    browser = await puppeteer.launch({ headless: false });
    // the above line represents the running browser window that gets created
//    page = await browser.newPage()
    // the above line represents one tab inside the browser

    page = await Page.build()
    await page.goto('localhost:3000');
})

afterEach(async () => {
    //await browser.close();
    await page.close();
})

test('the header has the correct test', async () => {
    //const text = await page.$eval('a.brand-logo', el => el.innerHTML);
    const text = await page.getContentsOf('a.brand-logo');
    expect(text).toEqual('Blogster');
})

test('clicking login starts oauth flow', async () => {
    await page.click('.right a');
    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);
})

test('when signed in, shows logout button', async () => {
    //const user = await userFactory();
    //const { session, sig } = sessionFactory(user);

    //await page.setCookie({ name: 'session', value: session })
    //await page.setCookie({ name: 'session.sig', value: sig })
    //await page.goto('localhost:3000')
    //// the reason we go to the same page is because once the cookie is set we need to mechanically send a new request to the server to visit the page like it is the case in reality with oauth

    //await page.waitFor('a[href="/auth/logout"]');
    //const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML)
    await page.login();
    const text = await page.getContentsOf('a[href="/auth/logout"]');
    expect(text).toEqual('Logout');
})