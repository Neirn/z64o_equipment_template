import { IPlugin, IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';
import { bus } from 'modloader64_api/EventHandler';
import { OotOnlineEvents, Z64Online_EquipmentPak } from './Z64API/OotoAPI';
import { resolve, basename, join } from 'path';
import { IOOTCore } from 'modloader64_api/OOT/OOTAPI';
import { InjectCore } from 'modloader64_api/CoreInjection';
import { MMOnlineEvents } from './Z64API/MMOAPI';
import { readFileSync } from 'fs';

interface OotO_ZZ {
  equipment: string[];
}

interface MM_ZZ {
  equipment: string[];
}

class zzdata {
  OcarinaOfTime!: OotO_ZZ;
  MajorasMask!: MM_ZZ;
}

type Z64OnlineEvents = OotOnlineEvents | MMOnlineEvents;

class zzplayas implements IPlugin {
  ModLoader!: IModLoaderAPI;
  pluginName?: string | undefined;
  @InjectCore()
  core!: IOOTCore;

  preinit(): void { }
  init(): void {
    let zz: zzdata = (this as any)['metadata']['zzequipment'];
    let OOT = () => {
      zz.OcarinaOfTime.equipment.forEach(zobj => {
        this.processZobj(zobj, OotOnlineEvents.LOAD_EQUIPMENT_PAK);
      });
    };
    let MM = () => {
      zz.MajorasMask.equipment.forEach(zobj => {
        this.processZobj(zobj, MMOnlineEvents.LOAD_EQUIPMENT_PAK);
      });
    };

    OOT();
    MM();
  }
  postinit(): void { }
  onTick(): void { }


  processZobj(zobj: string, event: Z64OnlineEvents) {
    if (zobj !== '') {
      let data = readFileSync(resolve(join(__dirname, zobj)));
      let name = this.ModLoader.utils.hashBuffer(data);

      let nameOffset = name.indexOf("EQUIPMENTNAME");

      if (nameOffset == -1) {
        throw new Error('INVALID EQUIPMENT MANIFEST: ' + zobj);
      }

      // set name to filename if zobj doesn't have name embedded
      if (data.slice(nameOffset + 0x20, nameOffset + 0x2C).toString('utf8') === "EQUIPMENTCAT") {
        if (data.slice(nameOffset + 0x10, nameOffset + 0x20).toString('hex') === "00000000000000000000000000000000") {
          let defaultName = basename(zobj, '.zobj');
          if (defaultName.length >= 32) {
            defaultName = defaultName.substring(0, 32);
          }

          let nameBuf = Buffer.from(defaultName);

          let catOffset = data.indexOf("EQUIPMENTCAT");

          if (catOffset == -1) {
            throw new Error('INVALID EQUIPMENT MANIFEST: ' + zobj);
          }

          data = Buffer.concat([data.slice(0, nameOffset + 0x10), nameBuf, Buffer.alloc(nameBuf.length % 0x10, 0), data.slice(catOffset)]);
        }
      }

      bus.emit(
        event,
        new Z64Online_EquipmentPak(name, data)
      );
    }
  }


}

module.exports = zzplayas;
