import * as configuration from '../index';
import * as chai from 'chai';
import { fail, doesNotReject } from 'assert';
import { Config } from '../types';

chai.use(require('chai-match'));
const expect = chai.expect;

describe('config parser', () => {
    it('works with empty config', () => {
        let input = JSON.stringify({})
        let config = configuration.resolve(input)
        expect(config).to.be.empty
    })
    it('fails with invalid JSON', (done) => {
        let input = ""
        configuration.resolve(input).then((result) => {
            done(new Error("should fail"))
        },
            (err) => {
                done()
            })

    })
    it('fails with invalid image', (done) => {
        let input = JSON.stringify({ logo: "a.jpg" })
        configuration.resolve(input).then((result) => {
            done(new Error("should fail"))
        },
            (err) => {
                done()
            })
    })
});

describe('config loader', () => {
    let config: Config
    before(async () => {
        config = await configuration.resolveFile("varkes_config.json", __dirname)
    })
    it('works with basic config', () => {
        expect(config.name).equals("test")
        expect(config.logo).equals("../../assets/logo.svg")
        expect(config.location).not.empty
    })
    it('works with API JSON URL', ()=> {
        expect(config.apis[0].name).equals("test1")
        expect(config.apis[0].specification).match(new RegExp("/generated/.*\.json"))
    })
    it('works with API JSON file', ()=> {
        expect(config.apis[1].name).equals("test2")
        expect(config.apis[1].specification).match(new RegExp(".*\.json"))
    })
    it('works with Events Yaml URL', ()=> {
        expect(config.events[0].name).equals("test3")
        expect(config.events[0].specification).match(new RegExp("/generated/.*\.yaml"))
    })
    it('works with Events JSON file', ()=> {
        expect(config.events[1].name).equals("test4")
        expect(config.events[1].specification).match(new RegExp(".*\.json"))
    })
});
