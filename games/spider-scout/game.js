import { startPictureQuest } from "../../assets/picture-quest.js";
import { SPIDER_CHAPTERS, SPIDER_MISSIONS } from "./questions.js";
import { setupSpiderMotion } from "./spider-motion.js";

const watchSpider = setupSpiderMotion(document.getElementById("sceneArt"), document.getElementById("watchSpider"));
startPictureQuest({id:"spider-scout",world:"spider",chapters:SPIDER_CHAPTERS,missions:SPIDER_MISSIONS,onSceneChange:watchSpider});
