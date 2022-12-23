import copy from 'copy-to-clipboard';
import { Component, useContext } from 'solid-js';
import { useTranslation } from '../../../i18n';
import { Data } from '../../App';
import { DragPoster } from '@cn-ui/headless';
import { TagsToString } from '../../use/TagsConvertor';
import { Notice } from '../../utils/notice';
import { FloatPanel } from '@cn-ui/core';
import { Atom, atom } from '@cn-ui/use';

export const CheckBox: Component<{
    value: Atom<boolean>;
}> = (props) => {
    return <input type="checkbox" checked={props.value()}></input>;
};

export function CopyBtn() {
    const { enMode, usersCollection, emphasizeSymbol, iconBtn, nonBreakLine, forceEN } =
        useContext(Data);
    const { t } = useTranslation();
    const getTagString = () => {
        let final = TagsToString(
            usersCollection().map((i) => {
                // 中英文模式下的不同修改
                if (forceEN() || enMode()) {
                    return i;
                } else {
                    return { ...i, text: i.cn };
                }
            }),
            emphasizeSymbol()
        );
        nonBreakLine() && (final = final.replace('\n', ''));
        return final;
    };
    return (
        <FloatPanel
            popup={() => (
                <div class="blur-background mt-1 flex h-full w-32 flex-col gap-2 rounded-md p-2">
                    <span class="btn flex-none" onclick={() => nonBreakLine((i) => !i)}>
                        <CheckBox value={nonBreakLine}></CheckBox> {t('toolbar2.copyWithoutBreak')}
                    </span>

                    <span class="btn flex-none" onclick={() => forceEN((i) => !i)}>
                        <CheckBox value={forceEN}></CheckBox> {t('toolbar2.copyOnlyEN')}
                    </span>
                </div>
            )}
        >
            <DragPoster
                send={(send) => send('PURE_TAGS', getTagString())}
                text={() => getTagString()}
            >
                <span
                    class="btn h-full w-full"
                    onclick={() => {
                        copy(getTagString());
                        Notice.success(t('toolbar2.hint.copy'));
                    }}
                    title={t('toolbar2.hint.copy_drag')}
                >
                    {iconBtn() ? 'copy' : t('toolbar2.copy')}
                </span>
            </DragPoster>
        </FloatPanel>
    );
}
