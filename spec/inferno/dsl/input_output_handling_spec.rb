RSpec.describe Inferno::DSL::InputOutputHandling do
  describe '.available_inputs' do
    it 'does not combine differently named child inputs' do
      group = Class.new(Inferno::Entities::TestGroup) do
        id SecureRandom.uuid
        group do
          config(inputs: { a: { name: :b } })
          test do
            input :a
          end
        end

        group do
          config(inputs: { a: { name: :c } })
          test do
            input :a
          end
        end
      end

      expect(group.available_inputs.length).to eq(2)
      expect(group.available_inputs.values.map(&:name)).to eq(['b', 'c'])
    end
  end

  describe '.missing_inputs' do
    it 'returns missing inputs for a test' do
      example_test = Class.new(Inferno::Entities::Test)
      example_test.input :a, :b, :c
      example_test.input :d, optional: true
      missing_inputs = example_test.missing_inputs([{ name: 'a', value: 'a' }])
      expect(missing_inputs).to eq(['b', 'c'])

      missing_inputs = example_test.missing_inputs([{ name: 'a', value: 'a' }, { name: 'b', value: 'b' },
                                                    { name: 'c', value: 'c' }])
      expect(missing_inputs).to eq([])
    end

    it 'looks through children for required inputs' do
      example_test_group = Class.new(Inferno::Entities::TestGroup)
      example_test_group.input :e, :f
      example_test_group.test 'child test' do
        input :a, :b, :c
        input :d, optional: true
      end
      missing_inputs = example_test_group.missing_inputs([{ name: 'a', value: 'a' }, { name: 'e', value: 'e' }])
      expect(missing_inputs).to eq(['f', 'b', 'c'])

      missing_inputs = example_test_group.missing_inputs([{ name: 'a', value: 'a' }, { name: 'b', value: 'b' },
                                                          { name: 'c', value: 'c' }, { name: 'e', value: 'e' },
                                                          { name: 'f', value: 'f' }])
      expect(missing_inputs).to eq([])
    end

    it 'respects outputs of prior tests' do
      example_test_group = Class.new(Inferno::Entities::TestGroup)
      example_test_group.test 'child test with outputs' do
        input :a, :b
        output :c
      end
      example_test_group.test 'child test uses output' do
        input :c, :d
      end
      missing_inputs = example_test_group.missing_inputs([{ name: 'a', value: 'a' }, { name: 'd', value: 'd' }])
      expect(missing_inputs).to eq(['b'])
    end

    it 'does not include output that in a later test' do
      example_test_group = Class.new(Inferno::Entities::TestGroup)
      example_test_group.test 'child test' do
        input :a, :b
      end
      example_test_group.test 'child test with output' do
        output :a
      end
      missing_inputs = example_test_group.missing_inputs([{ name: 'b', value: 'b' }])
      expect(missing_inputs).to eq(['a'])
    end

    it 'handles renamed inputs' do
      example_test_group = Class.new(Inferno::Entities::TestGroup)
      example_test_group.input :url1
      example_test_group.test 'child test' do
        output :url2
      end
      example_test_group.test 'child test with output' do
        input :url1, name: :url2
      end

      missing_inputs = example_test_group.missing_inputs([{ name: 'url1', value: 'xyz' }])

      expect(missing_inputs).to eq([])
    end
  end
end