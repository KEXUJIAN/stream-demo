import { App } from "./app/app";
import "reflect-metadata";

class Boot {
    async boot() {
        new App().start();
    }
}

new Boot().boot();
