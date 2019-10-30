import * as configuration from '../index';
import * as chai from 'chai';
import { fail, doesNotReject } from 'assert';

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
        try {
            configuration.resolve(input)
            done(new Error("should fail"))
        } catch (error) {
            done()
        }
    })
    it('fails with invalid image', (done) => {
        let input = JSON.stringify({ logo: "a.jpg" })
        try {
            configuration.resolve(input)
            done(new Error("should fail"))
        } catch (error) {
            done()
        }
    })
});

describe('config loader', () => {
    it('works with basic config', () => {
        let config = configuration.resolveFile("varkes_config.json",__dirname)
        expect(config.name).equals("test")
        expect(config.logo).equals("../../assets/logo.svg")
        expect(config.location).not.empty
    })
});