import { findAttachments, isAttachment, getAttachments } from "./attachments/discovery";
import { createAttachmentsPanel } from "./attachments/panel";
import { createActions } from "./attachments/actions";
declare var Deletable: any;
declare var Panel: any;
declare var Mode: any;
declare var Blockbench: any;

let deletables: Deletable[] = [];
let eventListeners: { event: string, listener: () => void }[] = [];

function init() {
    console.log("Initializing attachments module with in-memory storage...");
    
    const actions = createActions();
    const panel = createAttachmentsPanel(actions);
        
    deletables.push(actions.importBB, actions.importVS, panel);
    const attachment_mode = new Mode('attachments', {
        name: 'Attachments',
        onSelect: () => {
            findAttachments();
        }
    });
    deletables.push(attachment_mode);

    const loadProjectListener = () => {
        console.log("LOAD PROJECT EVENT TRIGGERED");
        setTimeout(() => {
            console.log("Load project timeout - finding attachments");
            findAttachments();
        }, 100);
    };

    const updateOutlinerListener = () => {
        console.log("📝 OUTLINER UPDATE EVENT TRIGGERED");
        findAttachments();
    };

    const addGroupListener = () => {
        console.log("➕ ADD GROUP EVENT TRIGGERED");
        findAttachments();
    };

    Blockbench.on('load_project', loadProjectListener);
    Blockbench.on('update_outliner', updateOutlinerListener);
    Blockbench.on('add_group', addGroupListener);

    eventListeners.push(
        { event: 'load_project', listener: loadProjectListener },
        { event: 'update_outliner', listener: updateOutlinerListener },
        { event: 'add_group', listener: addGroupListener }
    );

    (window as any).debugFindAttachments = () => {
        console.log("Manual debug trigger");
        findAttachments();
    };

    console.log("Attachments module initialized successfully");
    console.log("Available debug functions:");
    console.log("- window.debugFindAttachments() - manually trigger attachment search");
}

function cleanup() {
    console.log("Attachments module cleaning up...");
    
    deletables.forEach((item) => {
            try {
                item.delete();
            } catch(e) {
                console.log(e);
            }
    });
    deletables = [];

    eventListeners.forEach(({ event, listener }) => {
        Blockbench.removeListener(event, listener);
        console.log(`Removed ${event} listener`);
    });
    eventListeners = [];

    if ((window as any).debugFindAttachments) {
        delete (window as any).debugFindAttachments;
    }

    console.log("Attachments module cleanup complete");
}

export const attachments = {
    init,
    cleanup,
    isAttachment
}
