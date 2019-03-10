import prism from 'prism-media';
import { OpusOptions } from 'prism-media/typings/opus/Opus';
import { Readable } from 'stream';
import ytdl, { downloadOptions, videoInfo } from 'ytdl-core';
import { IPrismVideoFormat } from './Types';

const filter = (format: IPrismVideoFormat) => {
    return format.audioEncoding === 'opus' &&
        format.container === 'webm' &&
        format.audioBitrate === 48000;
};

const play = (url: string, options: downloadOptions = {}): Promise<Readable> => {
    return new Promise((resolve, reject) => {
        ytdl.getInfo(url, (err: Error, info: videoInfo) => {
            if (err) return reject(err);

            const canDemux = info.formats.find(filter) && Number(info.length_seconds) !== 0;

            if (canDemux) {
                Object.assign(options, { filter });
            } else if (Number(info.length_seconds) !== 0) {
                Object.assign(options, { filter: 'audioonly' });
            }

            const ytdlStream = ytdl.downloadFromInfo(info, options);

            if (canDemux) {
                const demuxer = new prism.opus.WebmDemuxer();
                return resolve(ytdlStream.pipe(demuxer).on('end', () => demuxer.destroy()));
            } else {
                const transcoder = new prism.FFmpeg({
                    args: [
                        '-analyzeduration', '0',
                        '-loglevel', '0',
                        '-f', 's16le',
                        '-ar', '48000',
                        '-ac', '2'
                    ],
                });
                const opusOptions: OpusOptions = { frameSize: 960, channels: 2, rate: 48000 };

                const opus = new prism.opus.Encoder(opusOptions);
                const stream = ytdlStream.pipe(transcoder).pipe(opus);
                stream.on('close', () => {
                    transcoder.destroy();
                    opus.destroy();
                });
                return resolve(stream);
            }
        });
    });
};

export default play;