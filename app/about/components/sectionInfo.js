import {
    ArrowPathIcon,
    CloudArrowUpIcon,
    Cog6ToothIcon,
    FingerPrintIcon,
    LockClosedIcon,
    ServerIcon,
  } from '@heroicons/react/20/solid'
  
  const features = [
    {
      name: 'Push to deploy.',
      description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit aute id magna.',
      icon: CloudArrowUpIcon,
    },
    {
      name: 'SSL certificates.',
      description: 'Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.',
      icon: LockClosedIcon,
    },
    {
      name: 'Simple queues.',
      description: 'Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus.',
      icon: ArrowPathIcon,
    },
    {
      name: 'Advanced security.',
      description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit aute id magna.',
      icon: FingerPrintIcon,
    },
    {
      name: 'Powerful API.',
      description: 'Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo.',
      icon: Cog6ToothIcon,
    },
    {
      name: 'Database backups.',
      description: 'Ac tincidunt sapien vehicula erat auctor pellentesque rhoncus. ',
      icon: ServerIcon,
    },
  ]
  
  export default function SectionInfo() {
    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-12 lg:px-24 py-24 lg:py-32">
            
              {/* Image BEGINS */}
              <div className="relative overflow-hidden mb-8 lg:mb-16">
                  <img
                    alt="Hijauan Fauna Resources"
                    src="./artificialGrass.jpg"
                    width={2432}
                    height={1442}
                    className="rounded-lg lg:rounded-3xl"
                  />
              </div>
              {/* Image ENDS */}

              {/* Features BEGINS */}
              <div className="mx-auto max-w-7xl">
                <dl className="mx-auto grid grid-cols-1 lg:grid-cols-3 gap-x-8 lg:gap-x-16 gap-y-8 lg:gap-y-16 text-justify text-balanced text-gray-600">
                  {features.map((feature) => (
                    <div key={feature.name} className="relative pl-8">
                      <dt className="inline font-bold text-[#C39533]">
                        <feature.icon aria-hidden="true" className="absolute top-1 left-1 size-5 text-[#C39533]" />
                        {feature.name}
                      </dt>{' '}
                      <dd className="inline">{feature.description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              {/* Features ENDS */}

            </div>
        </div>
    )
  }