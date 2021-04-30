import { IPlugin, IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';
import { bus } from 'modloader64_api/EventHandler';
import { OotOnlineEvents, Z64Online_EquipmentPak } from './Z64API/OotoAPI';
import path from 'path';
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
        if (zobj !== '') {
          bus.emit(
            OotOnlineEvents.LOAD_EQUIPMENT_PAK,
            new Z64Online_EquipmentPak(zobj,
              readFileSync(path.resolve(path.join(__dirname, zobj))))
          );
        }
      });
    };
    let MM = () => {
      zz.MajorasMask.equipment.forEach(zobj => {
        if (zobj !== '') {
          bus.emit(
            OotOnlineEvents.LOAD_EQUIPMENT_PAK,
            new Z64Online_EquipmentPak(zobj,
              readFileSync(path.resolve(path.join(__dirname, zobj))))
          );
        }
      });
    };

    OOT();
    MM();
  }
  postinit(): void { }
  onTick(): void { }
}

module.exports = zzplayas;
