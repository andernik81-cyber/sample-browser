import './audio-settings.css'

const AUDIO_FIELDS = [
  {
    key: 'driver', id: 'driver', label: 'Audio Driver',
    options: [['asio', 'ASIO'], ['wasapi', 'WASAPI'], ['directsound', 'DirectSound']],
  },
  {
    key: 'device', id: 'device', label: 'Audio Device',
    options: [['default-device', 'Default Device'], ['no-device', 'No Device'], ['example-asio-device', 'Example ASIO Device']],
  },
  {
    key: 'sampleRate', id: 'sample-rate', label: 'Sample Rate',
    options: [44100, 48000, 88200, 96000, 176400, 192000].map((value) => [value, `${value} Hz`]),
  },
  {
    key: 'bufferSize', id: 'buffer-size', label: 'Buffer Size',
    options: [32, 64, 128, 256, 512, 1024, 2048].map((value) => [value, `${value} samples`]),
    description: 'Lower values reduce latency but increase CPU load.',
  },
  {
    key: 'output', id: 'output', label: 'Output',
    options: ['1-2', '3-4', '5-6', '7-8'].map((value) => [value, `Output ${value}`]),
  },
]

export const AudioSettings = ({ audio, onChange }) => (
  <div className="settings-audio-fields" data-testid="settings-audio-fields">
    {AUDIO_FIELDS.map(({ key, id, label, options, description }) => (
      <div key={key} className="settings-audio-field" data-testid={`settings-audio-${id}-field`}>
        <label
          htmlFor={`settings-audio-${id}`}
          className="settings-audio-label"
          data-testid={`settings-audio-${id}-label`}
        >
          {label}
        </label>
        <select
          id={`settings-audio-${id}`}
          className="settings-audio-select"
          data-testid={`settings-audio-${id}`}
          value={audio[key]}
          aria-describedby={description ? `settings-audio-${id}-description` : undefined}
          onChange={(event) => onChange(key, options.find(([value]) => String(value) === event.target.value)[0])}
        >
          {options.map(([value, text]) => (
            <option key={value} value={value} data-testid={`settings-audio-${id}-option-${value}`}>{text}</option>
          ))}
        </select>
        {description && (
          <p id={`settings-audio-${id}-description`} className="settings-audio-description" data-testid={`settings-audio-${id}-description`}>
            {description}
          </p>
        )}
      </div>
    ))}
  </div>
)