import { useContext } from 'solid-js';
import { Data, IData } from './App';
import { TagButton } from './components/TagButton';
import { reflect } from '@cn-ui/use';
import isMobile from 'is-mobile';
import { SortableList } from '@cn-ui/sortable';
import { HeaderFirst } from './ToolBar/HeaderFirst';
import { HeaderSecond } from './ToolBar/HeaderSecond';
import { t } from 'i18next';
import { useTagController } from './use/useTagController';
import { TagsToString, stringToTags } from './use/TagsConvertor';
import { Notice } from './utils/notice';
import { Message } from './MessageHint';
import { CombineMagic } from './utils/CombineMagic';
import { DropReceiver, useDragAndDropData } from '@cn-ui/headless';
import tinykeys from 'tinykeys';
export const BindHistoryKey = () => {
    const { redo, undo } = useContext(Data);

    tinykeys(window, {
        '$mod+KeyZ': (event) => {
            event.preventDefault();
            undo();
        },
        '$mod+KeyY': (event) => {
            event.preventDefault();
            redo();
        },
    });
};

export const UserSelected = () => {
    const {
        deleteMode,
        enMode,
        usersCollection,
        emphasizeAddMode,
        emphasizeSubMode,
        lists,
        TagsHistory,
    } = useContext(Data);
    const { wheelEvent, clickEvent } = useTagController();
    BindHistoryKey();
    const disabledSortable = reflect(() => {
        return isMobile() ? emphasizeAddMode() || emphasizeSubMode() || deleteMode() : false;
    });
    const { send } = useDragAndDropData();
    let breakCounter = 0;

    /** 注入拖拽值得方式 */
    const injectTags = (old: IData[], input: IData[], isCombine = false, isTailAdd = false) => {
        if (isCombine) {
            const list = CombineMagic(input, old);
            usersCollection(list);
            Message.success(t('publicPanel.hint.CombineSuccess'));
        } else if (isTailAdd) {
            usersCollection((i) => [...i, ...input]);
            Notice.success(t('publicPanel.hint.CopySuccess'));
        } else {
            usersCollection(input);
            Notice.success(t('publicPanel.hint.CopySuccess'));
        }
    };
    const INPUT_MAGIC = (tags: string, _, e: DragEvent) => {
        const old = usersCollection();
        TagsHistory.addToHistory(TagsToString(old));
        let isCombine = e.ctrlKey;
        let isTailAdd = e.altKey;

        const input = stringToTags(tags, lists());
        injectTags(old, input, isCombine, isTailAdd);
        /** @ts-ignore 往里面加一个 done 值，然后可以整个结构传递 */
        e.done = true;
        return false;
    };
    return (
        <DropReceiver
            detect={{
                ADD_BEFORE() {
                    Message.success(t('userSelect.message.addTail'));
                },
                INPUT_MAGIC(_, e: DragEvent) {
                    if (e.ctrlKey) {
                        Message.success(t('userSelect.message.combine'));
                    } else if (e.altKey) {
                        Message.success(t('userSelect.message.TailAdd'));
                    } else {
                        Message.success(t('userSelect.message.input'));
                    }
                },
            }}
            receive={{
                ADD_BEFORE(info) {
                    usersCollection((i) => [...i, ...stringToTags(info, lists())]);
                },
                INPUT_MAGIC,
                extra(_, dataTransfer: DataTransfer, e: DragEvent) {
                    if ((e as any).ignore) return;
                    const text = dataTransfer.getData('text');
                    console.log('触发文字传递');
                    if (text) {
                        const old = usersCollection();
                        TagsHistory.addToHistory(TagsToString(old));
                        const input = stringToTags(text, lists());
                        injectTags(old, input, e.ctrlKey);
                    }
                },
            }}
        >
            <main class="user-selected  my-2 flex w-full flex-col rounded-xl border border-solid border-gray-600 p-2 ">
                <HeaderFirst></HeaderFirst>
                <SortableList
                    class="scroll-box flex flex-wrap overflow-y-auto overflow-x-hidden text-sm"
                    style={{
                        'max-height': '40vh',
                        'min-height': '10vh',
                    }}
                    setData={(data, el) => {
                        // 向拖拽单位输入数据
                        const item = usersCollection().find((i) => i.en === el.dataset.id);
                        item && send(data, { type: 'USER_SELECTED', data: item });
                    }}
                    each={usersCollection}
                    options={{}}
                    disabled={disabledSortable}
                >
                    {(item) => {
                        const id = item.text === '\n' ? `\n${breakCounter++}` : item.en;
                        // 强行装入一个副作用
                        (item as any).id = id;
                        return (
                            <div
                                data-id={id}
                                classList={{
                                    ['basis-full']: item.text === '\n',
                                }}
                            >
                                <DropReceiver
                                    detect={{
                                        ADD_BEFORE() {
                                            Message.success(t('userSelect.message.addBefore'));
                                        },
                                    }}
                                    receive={{
                                        ADD_BEFORE(info) {
                                            usersCollection((i) => {
                                                const temp = [...i];
                                                const dist = i.indexOf(item) ?? temp.length;

                                                temp.splice(
                                                    dist,
                                                    0,
                                                    ...stringToTags(info, lists())
                                                );
                                                return temp;
                                            });
                                            Notice.success(t('success'));
                                        },
                                        INPUT_MAGIC,
                                    }}
                                >
                                    <TagButton
                                        data={item}
                                        en={enMode}
                                        cn={reflect(() => !enMode())}
                                        onClick={
                                            item.text === '\n'
                                                ? () => {
                                                      deleteMode() &&
                                                          usersCollection((i) =>
                                                              i.filter((it) => it !== item)
                                                          );
                                                  }
                                                : clickEvent
                                        }
                                        onWheel={(info, delta, e) => {
                                            e.preventDefault();
                                            // console.log('onWheel');
                                            wheelEvent(info, delta);
                                        }}
                                    ></TagButton>
                                </DropReceiver>
                            </div>
                        );
                    }}
                </SortableList>

                {usersCollection().length === 0 && (
                    <span class=" whitespace-pre-wrap text-center font-light text-sky-500">
                        {t('userSelect.hint.add')}
                    </span>
                )}
                <HeaderSecond></HeaderSecond>
            </main>
        </DropReceiver>
    );
};
