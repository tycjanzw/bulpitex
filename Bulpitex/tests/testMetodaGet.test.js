const request = require("supertest");
const app = require("..//app.js");

test('Odpowiadanie na metode GET', (done)=>{
    request(app)
    .get("/")
    .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.statusCode).not.toBe(400);
        done();
    });
});
