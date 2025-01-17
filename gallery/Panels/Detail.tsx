import { reflect } from '@cn-ui/use';
import { AIImageInfo } from 'prompt-extractor';
import { Show, useContext } from 'solid-js';
import { GalleryGlobal } from '../App';
import { AIImageInfoShower } from '../../src/components/AIImageInfoShower';
import { Panel } from '../../src/components/Panel';
import { BackupImage } from '../BackupImage';

export const getImagePath = (s: string) => {
    return s.replace('/t/', '/s/').replace('.jpg', '.png');
};
export const getImagePathBackup = (s: string, tail: string) => {
    // 兼容以前的 thumbsnap 的问题
    if (s.startsWith('https://thumbsnap.com'))
        return (
            `https://ik.imagekit.io/dfidfiskkxn/save/${getImagePath(s)
                .replace(/\.\w+$/, '')
                .split('/')
                .at(-1)}?` + tail
        );
    return s + `?` + tail;
};

export const DetailPanel = () => {
    const { ShowingPicture, getViewer, replaceImages, ShowingPictureURL } =
        useContext(GalleryGlobal);
    const details = reflect(() => {
        if (!ShowingPicture()) return null;
        const information = Object.fromEntries(
            JSON.parse(ShowingPicture()?.other || '[]')
        ) as AIImageInfo;
        if (!information.Description) {
            information.Description = ShowingPicture().tags;
        }
        return information;
    });
    return (
        <Panel id="detail">
            <Show when={ShowingPicture()}>
                <main class="z-10 flex h-full flex-col gap-4 overflow-auto break-words p-2 sm:flex-row sm:justify-evenly sm:p-4">
                    <nav
                        class="flex h-[30vh] max-w-[50vw] cursor-pointer flex-col items-center justify-center sm:h-full"
                        onclick={() => {
                            const { description } = ShowingPicture();
                            const image = ShowingPictureURL();
                            replaceImages([
                                {
                                    alt: description,
                                    src: image,
                                    origin: image,
                                },
                            ]);
                            getViewer().view(0);
                        }}
                    >
                        <BackupImage
                            src={getImagePathBackup(ShowingPicture().image, 'q=50')}
                            aspect={ShowingPicture().size.replace('x', '/')}
                            fallbackSrc={getImagePath(ShowingPicture().image)}
                        ></BackupImage>

                        <div class="btn ">点击查看大图</div>
                        <header class="my-2 w-full rounded-lg bg-lime-600 py-2 px-4 text-center text-2xl font-bold text-slate-200">
                            {ShowingPicture().description}
                        </header>
                    </nav>
                    <section class="flex select-text flex-col sm:overflow-hidden">
                        <main class="blur-background flex max-w-2xl flex-col gap-4 rounded-lg text-slate-200 sm:overflow-auto sm:p-4">
                            <nav class="flex justify-between rounded-lg bg-emerald-700 px-2">
                                <div>作者: {ShowingPicture().username}</div>
                                <div>种子号码: {ShowingPicture().seed}</div>
                            </nav>
                            <Show when={details()}>
                                <AIImageInfoShower data={details}></AIImageInfoShower>
                            </Show>
                        </main>
                    </section>
                </main>
            </Show>
        </Panel>
    );
};
