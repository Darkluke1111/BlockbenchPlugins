import { events } from "../util/events";
import { attachments } from "../attachments";

events.LOAD.subscribe(() => {
    attachments.init();
})

events.UNLOAD.subscribe(() => {
    attachments.cleanup();
})