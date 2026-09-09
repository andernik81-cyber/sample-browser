export const SAMPLE_STATUS = Object.freeze({
  READY: 'ready',
  ERROR: 'error',
})

export const WAVEFORM_STATUS = Object.freeze({
  NOT_LOADED: 'not-loaded',
  QUEUED: 'queued',
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
})

export function createSample({
  id,
  name,
  path,
  extension,
  duration = 0,
  channels = 0,
  sampleRate = 0,
  bitDepth = 0,
  fileSize = 0,
  status = SAMPLE_STATUS.READY,
  waveformState,
}) {
  return {
    id,
    name,
    path,
    extension: String(extension).toLowerCase(),
    duration,
    channels,
    sampleRate,
    bitDepth,
    fileSize,
    status,
    waveformState: waveformState || {
      status: WAVEFORM_STATUS.NOT_LOADED,
      cacheKey: null,
      sampleCount: 0,
      channels: 0,
    },
  }
}

export function createFolder({ id, name, path, parentId = null, status = 'online' }) {
  return { id, name, path, parentId, status }
}

export const INITIAL_TREE = {
  id: 'samples',
  name: 'Samples',
  path: 'D:\\Samples',
  parentId: null,
  status: 'online',
  children: [
    { id: 'ambience', name: 'Ambience', path: 'D:\\Samples\\Ambience', parentId: 'samples', status: 'online', children: [] },
    {
      id: 'drums', name: 'Drums', path: 'D:\\Samples\\Drums', parentId: 'samples', status: 'online', children: [
        { id: 'kick', name: 'Kick', path: 'D:\\Samples\\Drums\\Kick', parentId: 'drums', status: 'online', children: [] },
        { id: 'snare', name: 'Snare', path: 'D:\\Samples\\Drums\\Snare', parentId: 'drums', status: 'online', children: [] },
        { id: 'hihat', name: 'Hihat', path: 'D:\\Samples\\Drums\\Hihat', parentId: 'drums', status: 'online', children: [] },
      ],
    },
    { id: 'instruments', name: 'Instruments', path: 'D:\\Samples\\Instruments', parentId: 'samples', status: 'online', children: [] },
  ],
}

const mock = (id, name, extension, duration, channels, sampleRate, bitDepth, fileSize, folderPath) => createSample({
  id,
  name,
  path: `${folderPath}\\${name}.${extension}`,
  extension,
  duration,
  channels,
  sampleRate,
  bitDepth,
  fileSize,
  waveformState: {
    status: WAVEFORM_STATUS.READY,
    cacheKey: `mock:${id}`,
    sampleCount: 160,
    channels,
  },
})

export const INITIAL_FILES = {
  snare: [
    mock('snare-1', 'Snare 1', 'wav', 63.44, 2, 44100, 24, 6720000, 'D:\\Samples\\Drums\\Snare'),
    mock('snare-2', 'Snare 2', 'wav', 2.23, 2, 44100, 16, 197000, 'D:\\Samples\\Drums\\Snare'),
    mock('snare-3', 'Snare 3', 'aif', 5.47, 1, 48000, 24, 1313000, 'D:\\Samples\\Drums\\Snare'),
  ],
  kick: [
    mock('kick-1', 'Kick 1', 'wav', 1.12, 1, 44100, 24, 148000, 'D:\\Samples\\Drums\\Kick'),
    mock('kick-2', 'Kick 2', 'wav', 0.58, 1, 48000, 16, 56000, 'D:\\Samples\\Drums\\Kick'),
    mock('kick-3', 'Kick 3', 'flac', 2.04, 2, 96000, 24, 1170000, 'D:\\Samples\\Drums\\Kick'),
  ],
  hihat: [
    mock('hihat-1', 'Hihat 1', 'wav', 0.42, 1, 44100, 24, 74000, 'D:\\Samples\\Drums\\Hihat'),
    mock('hihat-2', 'Hihat 2', 'wav', 0.37, 1, 44100, 24, 65000, 'D:\\Samples\\Drums\\Hihat'),
  ],
  ambience: [
    mock('amb-1', 'Forest Morning', 'wav', 128.4, 2, 48000, 24, 18500000, 'D:\\Samples\\Ambience'),
    mock('amb-2', 'City Night', 'aif', 94.12, 2, 44100, 16, 8300000, 'D:\\Samples\\Ambience'),
  ],
  instruments: [
    mock('inst-1', 'Piano Chord A', 'wav', 3.21, 2, 48000, 24, 924000, 'D:\\Samples\\Instruments'),
    mock('inst-2', 'Bass Loop 120', 'wav', 3754.345, 2, 44100, 24, 396000000, 'D:\\Samples\\Instruments'),
    mock('inst-3', 'Strings Hit', 'aif', 1.48, 2, 96000, 24, 854000, 'D:\\Samples\\Instruments'),
  ],
}

export function createBrowserSample(file, id, rootName) {
  const relativePath = file.webkitRelativePath || file.name
  const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : ''
  return createSample({
    id,
    name: file.name.replace(/\.[^.]+$/, ''),
    path: `browser-folder:${encodeURIComponent(rootName)}/${encodeURIComponent(relativePath)}`,
    extension,
    duration: 0,
    channels: 0,
    sampleRate: 0,
    bitDepth: 0,
    fileSize: file.size || 0,
    status: SAMPLE_STATUS.READY,
  })
}
