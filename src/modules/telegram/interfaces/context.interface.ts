import { Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { SceneContext, SceneSession } from 'telegraf/typings/scenes';

export interface BotContext extends Context<Update> {
  session: SceneSession & {
    profile?: any;
    game?: any;
    [key: string]: any;
  };
  scene: SceneContext['scene'];
  match?: RegExpExecArray;
}